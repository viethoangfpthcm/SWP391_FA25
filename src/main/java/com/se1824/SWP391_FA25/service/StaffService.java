package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.AssignTechnicianRequest;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffService {

    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final AuthenticationService authService;

    /**
     * Lấy danh sách booking Pending của Service Center mà staff đang quản lý
     */
    public List<StaffBookingDTO> getPendingBookings() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        // Lấy center ID từ staff hiện tại
        Integer centerId = currentStaff.getServiceCenter().getId();
        log.info("Getting pending bookings for center ID: {} (Staff: {})",
                centerId, currentStaff.getUserId());

        // Lấy bookings của center này với status Pending
        List<Booking> bookings = bookingRepo.findByServiceCenter_IdAndStatus(centerId, "Pending");

        return bookings.stream()
                .map(this::mapToStaffBookingDTO)
                .collect(Collectors.toList());
    }
    public List<StaffBookingDTO> getAllBookings() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        Integer centerId = currentStaff.getServiceCenter().getId();
        List<Booking> bookings = bookingRepo.findByServiceCenter_Id(centerId);

        return bookings.stream()
                .map(this::mapToStaffBookingDTO)
                .collect(Collectors.toList());
    }


    /**
     * Staff approve booking
     */
    @Transactional
    public void approveBooking(Integer bookingId, String staffId) {
        log.info("Staff {} approving booking {}", staffId, bookingId);

        // Validate staff role
        validateStaffRole(staffId);

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + bookingId));

        if (!"Pending".equals(booking.getStatus())) {
            throw new InvalidDataException(
                    "Cannot approve booking with status: " + booking.getStatus());
        }

        booking.setStatus("Approved");
        bookingRepo.save(booking);
        log.info("Booking {} approved by staff {}", bookingId, staffId);
    }

    /**
     * Staff decline booking
     */
    @Transactional
    public void declineBooking(Integer bookingId, String staffId, String reason) {
        log.info("Staff {} declining booking {}", staffId, bookingId);

        // Validate staff role
        validateStaffRole(staffId);

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + bookingId));

        if (!"Pending".equals(booking.getStatus())) {
            throw new InvalidDataException(
                    "Cannot decline booking with status: " + booking.getStatus());
        }

        booking.setStatus("Declined");
        booking.setNote((booking.getNote() != null ? booking.getNote() + " | " : "")
                + "Declined reason: " + reason);
        bookingRepo.save(booking);
        log.info("Booking {} declined by staff {}", bookingId, staffId);
    }

    /**
     * Lấy danh sách technician của service center mà staff đang làm việc
     */
    public List<TechnicianDTO> getAvailableTechnicians() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        Integer centerId = currentStaff.getServiceCenter().getId();
        List<Users> technicians = userRepo.findByServiceCenter_IdAndUserIdStartingWith(
                centerId, "TE");

        return technicians.stream()
                .map(this::mapToTechnicianDTO)
                .collect(Collectors.toList());
    }

    /**
     * Staff assign technician cho booking
     */
    @Transactional
    public void assignTechnician(AssignTechnicianRequest request) {
        log.info("Assigning technician {} to booking {}",
                request.getTechnicianId(), request.getBookingId());

        // Validate staff
        validateStaffRole(request.getStaffId());

        // Validate booking
        Booking booking = bookingRepo.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + request.getBookingId()));

        if (!"Approved".equals(booking.getStatus())) {
            throw new InvalidDataException(
                    "Can only assign technician to approved bookings");
        }

        // Validate technician
        Users technician = userRepo.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Technician not found with ID: " + request.getTechnicianId()));

        if (!technician.getUserId().startsWith("TE")) {
            throw new InvalidDataException("Invalid technician ID");
        }

        // Assign
        booking.setAssignedTechnician(technician);
        bookingRepo.save(booking);
        log.info("Technician {} assigned to booking {} by staff {}",
                request.getTechnicianId(), request.getBookingId(), request.getStaffId());
    }

    // ==================== Private Helper Methods ====================

    private void validateStaffRole(String userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        if (!user.getUserId().startsWith("ST")) {
            throw new InvalidDataException("Only staff can perform this action");
        }
    }

    private StaffBookingDTO mapToStaffBookingDTO(Booking booking) {
        StaffBookingDTO dto = new StaffBookingDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCustomerName(booking.getCustomer().getFullName());
        dto.setCustomerPhone(booking.getCustomer().getPhone());
        dto.setVehiclePlate(booking.getVehicle().getLicensePlate());
        dto.setVehicleModel(booking.getVehicle().getModel());
        dto.setCurrentKm(booking.getVehicle().getCurrentKm());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStatus(booking.getStatus());
        dto.setNote(booking.getNote());
        dto.setCenterName(booking.getServiceCenter().getName());
        return dto;
    }

    private TechnicianDTO mapToTechnicianDTO(Users technician) {
        TechnicianDTO dto = new TechnicianDTO();
        dto.setUserId(technician.getUserId());
        dto.setFullName(technician.getFullName());
        dto.setPhone(technician.getPhone());

        // Đếm số booking đang active
        int activeBookings = bookingRepo.countByAssignedTechnician_UserIdAndStatusIn(
                technician.getUserId(),
                List.of("Approved", "In Progress"));
        dto.setActiveBookings(activeBookings);

        return dto;
    }
}