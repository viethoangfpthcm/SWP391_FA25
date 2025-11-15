package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    @Autowired
    AnalyticService analyticService;
    @Autowired
    ServiceCenterService serviceCenterService;
    @Autowired
    FeedbackService feedbackService;
    @Autowired
    MaintenanceChecklistService checklistService;
    @Autowired
    MaintenanceScheduleRepository maintenanceScheduleRepo;

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

    /**
     * Lấy dữ liệu doanh thu cho Manager (chỉ center của Manager)
     */
    public RevenueAnalyticsResponse getRevenueAnalyticsForManager(Integer month, Integer year) {
        Users manager = auth.getCurrentAccount();
        if (manager.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }
        Integer centerId = manager.getCenter().getId();
        log.info("Fetching revenue analytics for Manager at center: {}, month: {}, year: {}", centerId, month, year);

        // Gọi AnalyticService với đúng thứ tự tham số: month, year, centerId
        return analyticService.getRevenueAnalytics(month, year, centerId);
    }

    /**
     * Lấy dữ liệu booking cho Manager (chỉ center của Manager)
     */
    public BookingAnalyticsResponse getBookingAnalyticsForManager(Integer month, Integer year) {
        Users manager = auth.getCurrentAccount();
        if (manager.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }
        Integer centerId = manager.getCenter().getId();
        log.info("Fetching booking analytics for Manager at center: {}, month: {}, year: {}", centerId, month, year);

        // Gọi AnalyticService với đúng thứ tự tham số: month, year, centerId
        return analyticService.getBookingAnalytics(month, year, centerId);
    }

    /**
     * Lấy dữ liệu linh kiện cho Manager (chỉ center của Manager)
     */
    public PartAnalyticsResponse getPartAnalyticsForManager(Integer month, int year) {
        Users manager = auth.getCurrentAccount();
        validateManagerRole(manager.getUserId());

        // Tự động lấy centerId của Manager
        Integer centerId = manager.getCenter().getId();
        log.info("Fetching part analytics for Manager at center: {}", centerId);

        // Gọi service chung với centerId cố định
        return serviceCenterService.getPartAnalytics(centerId, month, year);
    }
    /**
     * Lấy dữ liệu feedback cho Manager (chỉ center của Manager)
     */
    public FeedbackStatsDTO getFeedbackAnalyticsForManager() {
        Users manager = auth.getCurrentAccount();
        if (manager.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }
        Integer centerId = manager.getCenter().getId();
        log.info("Fetching feedback analytics for Manager at center: {}", centerId);
        return feedbackService.getFeedbackStats(centerId);
    }

    /**
     * MANAGER: Lấy chi tiết 1 booking
     */
    public StaffBookingDTO getBookingById(Integer bookingId, Integer managerId) {
        validateManagerRole(managerId);
        Users manager = auth.getCurrentAccount();

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // Validation: Booking có thuộc center của Manager không?
        if (!booking.getServiceCenter().getId().equals(manager.getCenter().getId())) {
            throw new InvalidDataException("This booking does not belong to your service center.");
        }
        return mapToStaffBookingDTO(booking);
    }

    /**
     * MANAGER: Lấy chi tiết 1 payment (theo bookingId)
     */
    public PaymentDTO getPaymentByBookingId(Integer bookingId, Integer managerId) {
        validateManagerRole(managerId);
        Users manager = auth.getCurrentAccount();

        Payment payment = paymentRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking ID: " + bookingId));

        // Validation: Payment có thuộc center của Manager không?
        if (!payment.getBooking().getServiceCenter().getId().equals(manager.getCenter().getId())) {
            throw new InvalidDataException("This payment does not belong to your service center.");
        }
        return mapToPaymentDTO(payment);
    }

    /**
     * MANAGER: Lấy chi tiết 1 checklist (theo bookingId)
     */
    public MaintenanceChecklistResponse getChecklistByBookingId(Integer bookingId, Integer managerId) {
        validateManagerRole(managerId);
        // Hàm getChecklistByBookingIdForStaff đã bao gồm logic kiểm tra center
        // (Vì nó được thiết kế cho Staff/Manager)
        return checklistService.getChecklistByBookingIdForStaff(bookingId);
    }

    /**
     * MANAGER: Lấy chi tiết 1 feedback (theo bookingId)
     */
    public FeedbackDTO getFeedbackByBookingId(Integer bookingId, Integer managerId) {
        validateManagerRole(managerId);
        Users manager = auth.getCurrentAccount();

        Feedback feedback = feedbackService.getFeedbackByBookingId(bookingId);
        if (feedback == null) {
            throw new ResourceNotFoundException("Feedback not found for booking ID: " + bookingId);
        }

        // Validation: Feedback có thuộc center của Manager không?
        if (!feedback.getBooking().getServiceCenter().getId().equals(manager.getCenter().getId())) {
            throw new InvalidDataException("This feedback does not belong to your service center.");
        }
        // Yêu cầu hàm convertToDto trong FeedbackService phải là public
        return feedbackService.convertToDto(feedback);
    }
    public List<String> getAvailableVehicleModels() {
        List<MaintenanceSchedule> schedules = maintenanceScheduleRepo.findAll();

        return schedules.stream()
                .map(MaintenanceSchedule::getVehicleModel)
                .distinct()
                .sorted()
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
        if (booking.getMaintenancePlan() != null) {
            dto.setPlanName(booking.getMaintenancePlan().getName());
        } else {
            dto.setPlanName(null);
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
        dto.setCustomerName(payment.getBooking().getCustomer().getFullName());
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
