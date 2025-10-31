package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.PaymentDTO;
import com.se1824.SWP391_FA25.dto.StaffBookingDTO;
import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Part;
import com.se1824.SWP391_FA25.entity.Payment;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerService {
    @Autowired
    PartRepository partRepo;
    @Autowired
    AuthenticationService auth;
    @Autowired
    UserRepository userRepo;
    @Autowired
    MaintenanceChecklistRepository checklistRepo;
    @Autowired
    FeedbackRepository feedbackRepo;
    @Autowired
    BookingRepository bookingRepo;
    @Autowired
    ServiceCenterRepository serviceCenterRepo;
    @Autowired
    PaymentRepository paymentRepo;

    /*
     * Lấy part theo centerId mà Manager đang làm việc
     * */
    public List<Part> getAllPart() {
        Users user = auth.getCurrentAccount();
        if (user.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }

        return partRepo.findByServiceCenterIdWithPartType(user.getCenter().getId());
    }

    /*
     * Lấy danh sách staff và technician của center
     * */
    public List<UserManagementDTO> getAllUsers() {
        Users user = auth.getCurrentAccount();
        if (user.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }

        return userRepo.findAll()
                .stream()
                .filter(u -> (u.getRole() == UserRole.TECHNICIAN || u.getRole() == UserRole.STAFF) && u.getCenter().getId().equals(user.getCenter().getId()))
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    public List<StaffBookingDTO> getAllBookings(Integer managerId) {
        log.info("Admin {} fetching all bookings in the system", managerId);
        validateManagerRole(managerId);
        Users user = auth.getCurrentAccount();
        List<Booking> allBookings = bookingRepo.findByOrderByBookingDateDesc();
        return allBookings.stream()
                .filter(b -> b.getServiceCenter().getId().equals(user.getCenter().getId()))
                .map(this::mapToStaffBookingDTO)
                .collect(Collectors.toList());
    }


    public List<PaymentDTO> getPaymentsByCenter(Integer centerId, Integer managerId) {
        log.info("Admin {} fetching payments for center {}", managerId, centerId);
        validateManagerRole(managerId);
        serviceCenterRepo.findById(centerId)
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + centerId));

        List<Payment> payments = paymentRepo.findByBooking_ServiceCenter_Id(centerId);

        return payments.stream()
                .map(this::mapToPaymentDTO)
                .collect(Collectors.toList());
    }

    //=====================================================================
    private UserManagementDTO mapToUserManagementDTO(Users user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        if (user.getCenter() != null) {
            dto.setCenterId(user.getCenter().getId());
            dto.setCenterName(user.getCenter().getName());
        }
        dto.setIsActive(user.getIsActive());
        return dto;
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
                        dto.setChecklistStatus(null);
                        log.debug("Found checklist for booking {} but status is null", booking.getBookingId());
                    }
                });
        boolean feedbackExists = feedbackRepo.existsByBooking_BookingId(booking.getBookingId());
        dto.setHasFeedback(feedbackExists);
        log.debug("Feedback exists for booking {}: {}", booking.getBookingId(), feedbackExists);
        return dto;
    }

    private void validateManagerRole(Integer userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager user not found with ID: " + userId));
        if (user.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }
    }

    private PaymentDTO mapToPaymentDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setBookingId(payment.getBooking().getBookingId());
        if (payment.getBooking() != null && payment.getBooking().getServiceCenter() != null) {
            dto.setCenterId(payment.getBooking().getServiceCenter().getId());
            dto.setCenterName(payment.getBooking().getServiceCenter().getName());
        }
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus().name());
        dto.setNote(payment.getNote());
        BigDecimal laborCost = (payment.getLaborCost() == null) ? BigDecimal.ZERO : payment.getLaborCost();
        BigDecimal materialCost = (payment.getMaterialCost() == null) ? BigDecimal.ZERO : payment.getMaterialCost();

        dto.setLaborCost(laborCost);
        dto.setMaterialCost(materialCost);
        dto.setTotalAmount(laborCost.add(materialCost));
        return dto;
    }
}
