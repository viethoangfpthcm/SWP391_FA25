package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.BookingStatus;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.CreateBookingRequest;
import com.se1824.SWP391_FA25.model.response.BookingResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PaymentResponse;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final VehicleRepository vehicleRepo;
    private final ServiceCenterRepository serviceCenterRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final MaintenancePlanRepository planRepo;
    private final MaintenanceChecklistService maintenanceChecklistService;
    private final AuthenticationService authenticationService;

    /*
     *   Lấy thông tin booking thêm booking id
     */
    public Booking getBookingById(Integer bookingId) {
        return bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + bookingId));
    }

    /**
     * Lấy thông tin xe để chuẩn bị đặt lịch
     */
    public VehicleBookingDTO getVehicleForBooking(String licensePlate, Integer userId) {
        log.info("Getting vehicle booking info for: {}", licensePlate);

        Vehicle vehicle = vehicleRepo.findById(licensePlate)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + licensePlate));

        if (!vehicle.getOwner().getUserId().equals(userId)) {
            throw new InvalidDataException("Vehicle does not belong to this user");
        }

        VehicleBookingDTO dto = new VehicleBookingDTO();
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setCurrentKm(vehicle.getCurrentKm());

        // Lấy danh sách trung tâm
        List<ServiceCenter> centers = serviceCenterRepo.findAll();
        dto.setAvailableCenters(centers.stream()
                .map(this::mapToServiceCenterDTO)
                .collect(Collectors.toList()));


        List<Booking> vehicleBookings = bookingRepo.findByVehicle_LicensePlate(licensePlate);
        Set<BookingStatus> resolvedStatuses = Set.of(
                BookingStatus.COMPLETED,
                BookingStatus.DECLINED,
                BookingStatus.CANCELLED
        );
        List<BookingResponse> activeBookings = vehicleBookings.stream()
                .filter(booking -> !resolvedStatuses.contains(booking.getStatus()))
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        dto.setCurrentBookings(activeBookings);
        dto.setHasActiveBooking(!activeBookings.isEmpty());

        log.info("Vehicle {} has {} active bookings", licensePlate, activeBookings.size());

        return dto;
    }

    /**
     * Lấy danh sách booking đã hoàn thành Checklist và sẵn sàng thanh toán
     */
    public List<PaymentResponse> getBookingsReadyForPayment(Integer userId) {
        List<Booking> allBookings = bookingRepo.findByCustomer_UserId(userId);
        List<PaymentResponse> readyForPaymentList = new ArrayList<>();
        final String STATUS_COMPLETED = "Completed";

        for (Booking booking : allBookings) {
            try {
                if (booking.getStatus() != BookingStatus.PAID) {
                    MaintenanceChecklistResponse checklist =
                            maintenanceChecklistService.getChecklistByCustomerAndId(booking.getBookingId());

                    if (checklist != null && STATUS_COMPLETED.equalsIgnoreCase(checklist.getStatus())) {
                        PaymentResponse paymentResponse = mapToPaymentResponse(booking, checklist);
                        readyForPaymentList.add(paymentResponse);
                    }
                }
            } catch (Exception e) {
                log.warn("Could not process booking {}: {}", booking.getBookingId(), e.getMessage());
            }
        }
        return readyForPaymentList;
    }

    private PaymentResponse mapToPaymentResponse(Booking booking, MaintenanceChecklistResponse checklist) {
        if (checklist == null) return null;
        PaymentResponse response = new PaymentResponse();
        response.setBookingId(booking.getBookingId());
        response.setCustomerName(booking.getCustomer().getFullName());
        response.setServiceCenterName(booking.getServiceCenter().getName());
        response.setVehicleModel(booking.getVehicle().getModel());
        response.setVehicleLicensePlate(booking.getVehicle().getLicensePlate());
        response.setNote(booking.getNote());
        response.setPaymentDate(LocalDateTime.now());

        response.setTotalAmount(checklist.getTotalCostApproved());
        response.setStatus(booking.getStatus().name());
        if (checklist.getDetails() != null) {
            List<MaintenanceChecklistDetailResponse> approvedDetails = checklist.getDetails().stream()
                    .filter(d -> "APPROVED".equalsIgnoreCase(d.getApprovalStatus()))
                    .collect(Collectors.toList());

            // Tính tổng labor cost và material cost từ các hạng mục đã duyệt
            BigDecimal totalLabor = approvedDetails.stream()
                    .map(MaintenanceChecklistDetailResponse::getLaborCost)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalMaterial = approvedDetails.stream()
                    .map(MaintenanceChecklistDetailResponse::getMaterialCost)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            response.setLaborCost(totalLabor);
            response.setMaterialCost(totalMaterial.add(BigDecimal.valueOf(100000)));

            response.setChecklistDetails(approvedDetails); // Chi tiết hạng mục đã được phê duyệt
        }

        return response;
    }

    /**
     * Tạo booking mới
     */
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Users current) {
        log.info("Creating booking for vehicle: {} at center: {}", request.getVehiclePlate(), request.getCenterId());
        Set<BookingStatus> resolvedStatuses = Set.of(
                BookingStatus.COMPLETED,
                BookingStatus.DECLINED,
                BookingStatus.CANCELLED
        );
        List<Booking> existingBookings = bookingRepo.findByVehicle_LicensePlate(request.getVehiclePlate());
        boolean hasActiveBooking = existingBookings.stream()
                .anyMatch(booking -> !resolvedStatuses.contains(booking.getStatus()));
        if (hasActiveBooking) {
            throw new InvalidDataException("Cannot create a new booking for this vehicle as it has an existing non-Paid booking");
        }

        Vehicle vehicle = vehicleRepo.findById(request.getVehiclePlate())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + request.getVehiclePlate()));

        if (!vehicle.getOwner().getUserId().equals(current.getUserId())) {
            throw new InvalidDataException("Vehicle does not belong to this user");
        }

        ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));
        LocalDateTime bookingDateTime = request.getBookingDate();
        LocalTime bookingTime = bookingDateTime.toLocalTime();

        // 2. Lấy giờ làm việc của trung tâm
        LocalTime openingHour = center.getOpeningHour();
        LocalTime closingHour = center.getClosingHour();
        if (bookingDateTime.isBefore(LocalDateTime.now())) {
            throw new InvalidDataException("Can booking for the past.");
        }
        if (bookingTime.isBefore(openingHour) || !bookingTime.isBefore(closingHour)) {
            throw new InvalidDataException(
                    String.format("Hour booking (%s) must be available between open and close time (từ %s đến %s).",
                            bookingTime.format(DateTimeFormatter.ofPattern("HH:mm")),
                            openingHour.format(DateTimeFormatter.ofPattern("HH:mm")),
                            closingHour.format(DateTimeFormatter.ofPattern("HH:mm"))
                    )
            );
        }
        // Tìm MaintenancePlan mà khách hàng đã chọn
        MaintenancePlan selectedPlan = planRepo.findById(request.getMaintenancePlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + request.getMaintenancePlanId()));

        Booking booking = new Booking();
        booking.setCustomer(current);
        booking.setVehicle(vehicle);
        booking.setServiceCenter(center);
        booking.setBookingDate(request.getBookingDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setNote(request.getNote());
        booking.setMaintenanceNo(selectedPlan.getMaintenanceNo());
        booking.setMaintenancePlan(selectedPlan);

        Booking savedBooking = bookingRepo.save(booking);
        log.info("Booking created successfully with ID: {} for Plan ID: {}", savedBooking.getBookingId(), selectedPlan.getId());

        return mapToBookingResponse(savedBooking);
    }
    /**
     * Lấy danh sách booking của customer
     */
    public List<BookingResponse> getCustomerBookings(Integer userId) {
        List<Booking> bookings = bookingRepo.findByCustomer_UserId(userId);
        return bookings.stream().map(this::mapToBookingResponse).collect(Collectors.toList());
    }

    /**
     * Hủy booking (chỉ khi status = Pending)
     */
    @Transactional
    public void cancelBooking(Integer bookingId, Integer userId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getCustomer().getUserId().equals(userId)) {
            throw new InvalidDataException("Booking does not belong to this user");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidDataException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepo.save(booking);
        log.info("Booking {} cancelled by user {}", bookingId, userId);
    }

    // ==================== Private Helper Methods ====================

    private ServiceCenterDTO mapToServiceCenterDTO(ServiceCenter center) {
        ServiceCenterDTO dto = new ServiceCenterDTO();
        dto.setId(center.getId());
        dto.setName(center.getName());
        dto.setAddress(center.getAddress());
        dto.setPhone(center.getPhone());
        return dto;
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setVehiclePlate(booking.getVehicle().getLicensePlate());
        response.setVehicleModel(booking.getVehicle().getModel());
        response.setCenterName(booking.getServiceCenter().getName());
        response.setCenterAddress(booking.getServiceCenter().getAddress());
        response.setBookingDate(booking.getBookingDate());
        response.setStatus(booking.getStatus().name());
        response.setNote(booking.getNote());
        return response;
    }
}