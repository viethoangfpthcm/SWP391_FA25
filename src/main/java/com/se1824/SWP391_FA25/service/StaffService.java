package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.BookingStatus;
import com.se1824.SWP391_FA25.enums.ChecklistStatus;
import com.se1824.SWP391_FA25.enums.UserRole;
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
    private final MaintenanceChecklistRepository checklistRepo;

    /**
     * Lấy danh sách booking Pending của Service Center mà staff đang quản lý
     */
    public List<StaffBookingDTO> getPendingBookings() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        Integer centerId = currentStaff.getCenter().getId();
        log.info("Getting pending bookings for center ID: {} (Staff: {})", centerId, currentStaff.getUserId());

        List<Booking> bookings = bookingRepo.findByServiceCenter_IdAndStatus(centerId, BookingStatus.PENDING);
        return bookings.stream().map(this::mapToStaffBookingDTO).collect(Collectors.toList());
    }
    public List<StaffBookingDTO> getAllBookings() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        Integer centerId = currentStaff.getCenter().getId();
        List<Booking> bookings = bookingRepo.findByServiceCenter_Id(centerId);
        return bookings.stream().map(this::mapToStaffBookingDTO).collect(Collectors.toList());
    }


    /**
     * Staff approve booking
     */
    @Transactional
    public void approveBooking(Integer bookingId, Integer staffId) {
        log.info("Staff {} approving booking {}", staffId, bookingId);
        validateStaffRole(staffId);

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidDataException("Cannot approve booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        bookingRepo.save(booking);
        log.info("Booking {} approved by staff {}", bookingId, staffId);
    }

    /**
     * Staff decline booking
     */
    @Transactional
    public void declineBooking(Integer bookingId, Integer staffId, String reason) {
        log.info("Staff {} declining booking {}", staffId, bookingId);
        validateStaffRole(staffId);

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidDataException("Cannot decline booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.DECLINED);
        booking.setNote((booking.getNote() != null ? booking.getNote() + " | " : "") + "Declined reason: " + reason);
        bookingRepo.save(booking);
        log.info("Booking {} declined by staff {}", bookingId, staffId);
    }

    /**
     * Lấy danh sách technician của service center mà staff đang làm việc
     */
    public List<TechnicianDTO> getAvailableTechnicians() {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());

        Integer centerId = currentStaff.getCenter().getId();
        List<Users> technicians = userRepo.findByCenter_IdAndRole(centerId, UserRole.TECHNICIAN);
        return technicians.stream().map(this::mapToTechnicianDTO).collect(Collectors.toList());
    }

    /**
     * Staff assign technician cho booking
     */
    @Transactional
    public void assignTechnician(AssignTechnicianRequest request, Integer staffId) {
        log.info("Assigning technician {} to booking {}", request.getTechnicianId(), request.getBookingId());
        validateStaffRole(staffId);

        Booking booking = bookingRepo.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidDataException("Can only assign technician to approved bookings");
        }

        Users technician = userRepo.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + request.getTechnicianId()));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new InvalidDataException("Invalid technician ID");
        }

        booking.setAssignedTechnician(technician);
        booking.setStatus(BookingStatus.ASSIGNED);
        bookingRepo.save(booking);
        log.info("Technician {} assigned to booking {} by staff {}", request.getTechnicianId(), request.getBookingId(), staffId);
    }
    /**
     * Staff bàn giao xe và hoàn tất booking
     * Yêu cầu: Booking status = "Paid" VÀ Checklist status = "Completed"
     */
    @Transactional
    public void handOverVehicle(Integer bookingId) {
        Users currentStaff = authService.getCurrentAccount();
        validateStaffRole(currentStaff.getUserId());
        log.info("Staff {} attempting to hand over vehicle for booking {}", currentStaff.getUserId(), bookingId);

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // 1. Validate staff's center
        if (!booking.getServiceCenter().getId().equals(currentStaff.getCenter().getId())) {
            throw new InvalidDataException("This booking does not belong to your service center.");
        }

        // 2. Kiểm tra Booking status (Phải là "PAID")
        if (booking.getStatus() != BookingStatus.PAID) {
            throw new InvalidDataException("Cannot hand over vehicle. Booking status must be 'Paid'. Current status: " + booking.getStatus());
        }

        // 3. Kiểm tra Checklist status (Phải là "COMPLETED")
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for booking ID: " + bookingId));

        if (checklist.getStatus() != ChecklistStatus.COMPLETED) {
            throw new InvalidDataException("Cannot hand over vehicle. Maintenance checklist must be 'Completed'. Current status: " + checklist.getStatus());
        }

        // 4. Cập nhật trạng thái Booking
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepo.save(booking);

        log.info("Booking {} successfully set to 'Completed' (vehicle handed over) by staff {}", bookingId, currentStaff.getUserId());
    }

    // ==================== Private Helper Methods ====================

    private void validateStaffRole(Integer userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        if (user.getRole() != UserRole.STAFF && user.getRole() != UserRole.ADMIN) {
            throw new InvalidDataException("Only STAFF or ADMIN can perform this action");
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
        dto.setStatus(booking.getStatus().name());
        dto.setNote(booking.getNote());
        dto.setCenterName(booking.getServiceCenter().getName());
        if (booking.getAssignedTechnician() != null) {
            dto.setTechnicianName(booking.getAssignedTechnician().getFullName());
        } else {
            dto.setTechnicianName(null);
        }
        checklistRepo.findByBooking_BookingId(booking.getBookingId())
                .ifPresent(checklist -> {
                    if (checklist.getStatus() != null) {
                        dto.setChecklistStatus(checklist.getStatus().name());
                        log.debug("Found checklist for booking {}: status = {}", booking.getBookingId(), checklist.getStatus().name());
                    } else {
                        dto.setChecklistStatus(null); // Hoặc "UNKNOWN"
                        log.debug("Found checklist for booking {} but status is null", booking.getBookingId());
                    }
                });
        return dto;
    }

    private TechnicianDTO mapToTechnicianDTO(Users technician) {
        TechnicianDTO dto = new TechnicianDTO();
        dto.setUserId(technician.getUserId());
        dto.setFullName(technician.getFullName());
        dto.setPhone(technician.getPhone());
        int activeBookings = bookingRepo.countByAssignedTechnician_UserIdAndStatusIn(
                technician.getUserId(),
                List.of(BookingStatus.APPROVED, BookingStatus.IN_PROGRESS, BookingStatus.ASSIGNED)
        );
        dto.setActiveBookings(activeBookings);
        return dto;
    }
}