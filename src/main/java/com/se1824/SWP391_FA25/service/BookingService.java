package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.CreateBookingRequest;
import com.se1824.SWP391_FA25.model.response.BookingResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
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

        List<ServiceCenter> centers = serviceCenterRepo.findAll();
        dto.setAvailableCenters(centers.stream().map(this::mapToServiceCenterDTO).collect(Collectors.toList()));

        return dto;
    }

    /**
     * Lấy danh sách booking đã hoàn thành Checklist và sẵn sàng thanh toán
     */
    public List<BookingResponse> getBookingsReadyForPayment(Integer userId) {
        List<Booking> allBookings = bookingRepo.findByCustomer_UserId(userId);
        List<BookingResponse> readyForPaymentList = new ArrayList<>();
        final String STATUS_COMPLETED = "Completed";

        for (Booking booking : allBookings) {
            try {
                MaintenanceChecklistResponse checklist =
                        maintenanceChecklistService.getChecklistByCustomerAndId(booking.getBookingId());

                if (checklist != null && STATUS_COMPLETED.equalsIgnoreCase(checklist.getStatus())) {
                    readyForPaymentList.add(mapToBookingResponse(booking));
                }
            } catch (Exception e) {
                log.warn("Could not process booking {}: {}", booking.getBookingId(), e.getMessage());
            }
        }
        return readyForPaymentList;
    }

    /**
     * Tạo booking mới
     */
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Users current) {
        log.info("Creating booking for vehicle: {} at center: {}", request.getVehiclePlate(), request.getCenterId());
        //validateBookingRequest(request);


        Vehicle vehicle = vehicleRepo.findById(request.getVehiclePlate())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + request.getVehiclePlate()));

        if (!vehicle.getOwner().getUserId().equals(current.getUserId())) {
            throw new InvalidDataException("Vehicle does not belong to this user");
        }

        ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));

        // 1. Tìm MaintenancePlan mà khách hàng đã chọn
        MaintenancePlan selectedPlan = planRepo.findById(request.getMaintenancePlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + request.getMaintenancePlanId()));

        Booking booking = new Booking();
        booking.setCustomer(current);
        booking.setVehicle(vehicle);
        booking.setServiceCenter(center);
        booking.setBookingDate(request.getBookingDate());
        booking.setStatus("Pending");
        booking.setNote(request.getNote());
        booking.setMaintenancePlan(selectedPlan); // 2. Gán plan đã chọn vào booking

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

        if (!"Pending".equals(booking.getStatus())) {
            throw new InvalidDataException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus("Cancelled");
        bookingRepo.save(booking);
        log.info("Booking {} cancelled by user {}", bookingId, userId);
    }

    // ==================== Private Helper Methods ====================

//    private void validateBookingRequest(CreateBookingRequest request) {
//
//        if (request.getVehiclePlate() == null || request.getVehiclePlate().trim().isEmpty()) {
//            throw new InvalidDataException("Vehicle plate is required");
//        }
//        if (request.getCenterId() == null) {
//            throw new InvalidDataException("Service center is required");
//        }
//        if (request.getBookingDate() == null) {
//            throw new InvalidDataException("Booking date is required");
//        }
//        if (request.getBookingDate().isBefore(LocalDateTime.now())) {
//            throw new InvalidDataException("Booking date must be in the future");
//        }
//
//        if (request.getMaintenancePlanId() == null) {
//            throw new InvalidDataException("Maintenance Plan ID is required");
//        }
//
//    }

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
        response.setStatus(booking.getStatus());
        response.setNote(booking.getNote());
        return response;
    }
}