package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.config.VNPayConfig;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

// 👈 THÊM 2 IMPORT NÀY
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceChecklistRepository checklistRepository;
    private final MaintenanceChecklistDetailRepository detailRepository;
    private final VNPayService vnPayService;
    private final VNPayConfig vnPayConfig;
    private final VehicleScheduleRepository vehicleScheduleRepository;
    private final VehicleRepository vehicleRepository;


    @Transactional
    public String createVnPayPayment(Integer bookingId, String ipAddress) {
        // (Hàm này của bạn đã OK, giữ nguyên)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        MaintenanceChecklist checklist = checklistRepository.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for this booking."));

        List<MaintenanceChecklistDetail> approvedDetails = detailRepository.findByChecklist_IdAndApprovalStatus(checklist.getId(), "APPROVED");

        BigDecimal totalLabor = approvedDetails.stream()
                .map(MaintenanceChecklistDetail::getLaborCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMaterial = approvedDetails.stream()
                .map(MaintenanceChecklistDetail::getMaterialCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAmount = totalLabor.add(totalMaterial);

        if (!"Completed".equalsIgnoreCase(checklist.getStatus())) {
            throw new InvalidDataException("Cannot create payment for an incomplete checklist.");
        }
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Total amount must be greater than zero to create a payment.");
        }

        Optional<Payment> existingPaymentOpt = paymentRepository.findByBooking_BookingId(bookingId);
        Payment paymentToProcess;

        if (existingPaymentOpt.isPresent()) {
            paymentToProcess = existingPaymentOpt.get();
            log.info("Payment for booking {} already exists with status {}. Reusing...",
                    bookingId, paymentToProcess.getStatus());
            if (!"PENDING".equals(paymentToProcess.getStatus())) {
                throw new InvalidDataException("Booking này đã được thanh toán (" + paymentToProcess.getStatus() + ") hoặc đã thất bại. Không thể tạo lại.");
            }
            paymentToProcess.setLaborCost(totalLabor);
            paymentToProcess.setMaterialCost(totalMaterial);
            paymentToProcess.setPaymentDate(LocalDateTime.now());
        } else {
            log.info("Creating new payment for booking {}", bookingId);
            paymentToProcess = new Payment();
            paymentToProcess.setBooking(booking);
            paymentToProcess.setLaborCost(totalLabor);
            paymentToProcess.setMaterialCost(totalMaterial);
            paymentToProcess.setStatus("PENDING");
            paymentToProcess.setPaymentDate(LocalDateTime.now());
        }

        Payment savedPayment = paymentRepository.save(paymentToProcess);
        String orderInfo = "Thanh toan don hang bao duong xe " + booking.getVehicle().getLicensePlate();

        return vnPayService.createOrder(
                totalAmount.intValue(),
                orderInfo,
                savedPayment.getPaymentId().toString(),
                booking.getCustomer(),
                ipAddress
        );
    }

    // 👈 THAY THẾ TOÀN BỘ HÀM NÀY
    @Transactional
    public int orderReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");

        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // --- BẮT ĐẦU XÁC THỰC HASH ---
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    // Dùng UTF-8
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    log.error("Error encoding field: {}", fieldName, e);
                }
            }
        }

        String calculatedHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());

        // 1. KIỂM TRA CHỮ KÝ
        if (!vnp_SecureHash.equals(calculatedHash)) {
            log.warn("VNPay SecureHash mismatch. Received: {}, Calculated: {}", vnp_SecureHash, calculatedHash);
            return 1; // Báo thất bại (Lỗi chữ ký)
        }
        // --- KẾT THÚC XÁC THỰC HASH ---

        // Chữ ký HỢP LỆ, bây giờ mới tin các tham số
        String responseCode = request.getParameter("vnp_ResponseCode");
        String txnRef = request.getParameter("vnp_TxnRef");

        if (txnRef == null || txnRef.isEmpty()) {
            log.error("VNPay callback missing transaction reference.");
            return 2; // Giao dịch không xác định
        }

        Integer paymentId = Integer.parseInt(txnRef.split("_")[0]);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        // 2. KIỂM TRA TRẠNG THÁI GIAO DỊCH (ResponseCode)
        if ("00".equals(responseCode)) {
            // Chỉ cập nhật nếu đang PENDING (tránh callback gọi lại nhiều lần)
            if ("PENDING".equals(payment.getStatus())) {
                payment.setStatus("PAID");
                payment.setPaymentMethod("VNPay");
                paymentRepository.save(payment);

                Booking booking = payment.getBooking();
                if (booking != null) {
                    booking.setStatus("Paid");
                    bookingRepository.save(booking);
                }

                // (Phần code cập nhật VehicleSchedule của bạn)
                if (booking.getMaintenanceNo() != null && booking.getVehicle() != null) {
                    Vehicle vehicle = booking.getVehicle();
                    vehicle.setCurrentMaintenanceNo(booking.getMaintenanceNo());
                    vehicleRepository.save(vehicle);
                    Integer completedMaintenanceNo = booking.getMaintenanceNo();
                    String licensePlate = booking.getVehicle().getLicensePlate();
                    List<VehicleSchedule> schedules = vehicleScheduleRepository.findByVehicle_LicensePlate(licensePlate);
                    schedules.stream()
                            .filter(s -> s.getMaintenanceNo() != null && s.getMaintenanceNo().equals(completedMaintenanceNo))
                            .findFirst()
                            .ifPresent(schedule -> {
                                schedule.setStatus("ON_TIME");
                                vehicleScheduleRepository.save(schedule);
                            });
                }
                log.info("Payment for booking ID {} was successful.", payment.getBooking().getBookingId());
            }
            return 0; // Thành công
        } else {
            // 3. GIAO DỊCH THẤT BẠI (do VNPay báo)
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            log.error("Payment for booking ID {} failed with VNPay response code: {}", payment.getBooking().getBookingId(), responseCode);
            return 1; // Thất bại
        }
    }
}