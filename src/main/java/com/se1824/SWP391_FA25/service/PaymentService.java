package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.config.VNPayConfig;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

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


    @Transactional
    public String createVnPayPayment(Integer bookingId, String ipAddress) {
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

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setLaborCost(totalLabor);
        payment.setMaterialCost(totalMaterial);
        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        String orderInfo = "Thanh toan don hang bao duong xe " + booking.getVehicle().getLicensePlate();
        // Truyền cả thông tin khách hàng
        return vnPayService.createOrder(totalAmount.intValue(), orderInfo, savedPayment.getPaymentId().toString(), booking.getCustomer(), ipAddress);
    }

    @Transactional
    public int orderReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Sắp xếp và tạo chuỗi hash để xác thực


        String responseCode = request.getParameter("vnp_ResponseCode");
        String txnRef = request.getParameter("vnp_TxnRef");

        if (txnRef == null || txnRef.isEmpty()) {
            log.error("VNPay callback missing transaction reference.");
            return 2; // Giao dịch không xác định
        }

        Integer paymentId = Integer.parseInt(txnRef.split("_")[0]);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if ("00".equals(responseCode)) {
            if ("PENDING".equals(payment.getStatus())) {
                payment.setStatus("PAID");
                payment.setPaymentMethod("VNPay");
                paymentRepository.save(payment);

                Booking booking = payment.getBooking();
                if (booking != null) {
                    booking.setStatus("Paid");
                    bookingRepository.save(booking);
                }
                if (booking.getMaintenanceNo() != null && booking.getVehicle() != null) {
                    // Lấy số mốc bảo dưỡng từ Booking vừa hoàn thành
                    Integer completedMaintenanceNo = booking.getMaintenanceNo();
                    String licensePlate = booking.getVehicle().getLicensePlate();

                    // 1. Tìm tất cả VehicleSchedule cho xe này
                    List<VehicleSchedule> schedules = vehicleScheduleRepository.findByVehicle_LicensePlate(licensePlate);

                    // 2. Tìm Schedule có maintenanceNo bằng với Booking vừa hoàn thành
                    schedules.stream()
                            .filter(s -> s.getMaintenanceNo() != null && s.getMaintenanceNo().equals(completedMaintenanceNo))
                            .findFirst()
                            .ifPresent(schedule -> {
                                schedule.setStatus("ON_TIME"); // Đánh dấu mốc này đã hoàn thành
                                vehicleScheduleRepository.save(schedule);
                            });
                }
                log.info("Payment for booking ID {} was successful.", payment.getBooking().getBookingId());
            }
            return 0; // Thành công
        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            log.error("Payment for booking ID {} failed with VNPay response code: {}", payment.getBooking().getBookingId(), responseCode);
            return 1; // Thất bại
        }
    }
}


