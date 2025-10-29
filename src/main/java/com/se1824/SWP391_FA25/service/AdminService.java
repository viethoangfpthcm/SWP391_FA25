package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.PaymentDTO;
import com.se1824.SWP391_FA25.dto.StaffBookingDTO;
import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.ApprovalStatus;
import com.se1824.SWP391_FA25.enums.BookingStatus;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.CreateUserRequest;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepo;
    private final ServiceCenterRepository serviceCenterRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationService authService;
    private final BookingRepository bookingRepo;
    private final PaymentRepository paymentRepo;
    private final MaintenanceChecklistRepository checklistRepo;
    private final MaintenanceChecklistService checklistService;
    private final MaintenanceChecklistDetailRepository checklistDetailRepo;
    private final FeedbackRepository feedbackRepository;

    /**
     * Tạo user mới (Staff | Technician | Customer) bởi Admin
     */
    @Transactional
    public UserManagementDTO createUser(CreateUserRequest request, Integer adminId) {
        log.info("Admin {} creating user with role {}", adminId, request.getRole());
        validateAdminRole(adminId);

        if (request.getRole() != UserRole.STAFF && request.getRole() != UserRole.TECHNICIAN && request.getRole() != UserRole.CUSTOMER) {
            throw new InvalidDataException("Can only create STAFF or TECHNICIAN or CUSTOMER roles.");
        }

        if (userRepo.findUserByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email already exists: " + request.getEmail());
        }
        if (userRepo.findByPhone(request.getPhone()) != null) {
            throw new InvalidDataException("Phone already exists: " + request.getPhone());
        }
        Users user = new Users();
        if (request.getRole() == UserRole.STAFF || request.getRole() == UserRole.TECHNICIAN) {
            if (request.getCenterId() == null) {
                throw new InvalidDataException("Service center is required for STAFF and TECHNICIAN");
            }
            ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));
            user.setCenter(center);
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(request.getRole());
        user.setIsActive(false);

        Users savedUser = userRepo.save(user);
        log.info("User created successfully with ID: {}", savedUser.getUserId());
        return mapToUserManagementDTO(savedUser);

    }

    /**
     * Lấy danh sách Staff
     */
    public List<UserManagementDTO> getAllStaff(Integer centerId) {
        List<Users> staff;
        if (centerId != null) {
            staff = userRepo.findByCenter_IdAndRole(centerId, UserRole.STAFF);
        } else {
            staff = userRepo.findByRole(UserRole.STAFF);
        }
        return staff.stream().map(this::mapToUserManagementDTO).collect(Collectors.toList());
    }

    /**
     * Lấy danh sách Technician
     */
    public List<UserManagementDTO> getAllTechnicians(Integer centerId) {
        List<Users> technicians;
        if (centerId != null) {
            technicians = userRepo.findByCenter_IdAndRole(centerId, UserRole.TECHNICIAN);
        } else {
            technicians = userRepo.findByRole(UserRole.TECHNICIAN);
        }
        return technicians.stream().map(this::mapToUserManagementDTO).collect(Collectors.toList());
    }

    /**
     * Lấy tất cả users (trừ Admin)
     */
    public List<UserManagementDTO> getAllUsers() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin update bất kỳ user nào (bao gồm centerId)
     */
    @Transactional
    public UserManagementDTO updateUserByAdmin(UpdateUserRequest request, Integer adminId, Integer userIdToUpdate) {
        log.info("Admin {} updating user {}", adminId, userIdToUpdate);
        validateAdminRole(adminId); // Xác thực quyền Admin

        Users user = userRepo.findById(userIdToUpdate)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userIdToUpdate));

        // Cập nhật FullName
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        // Cập nhật Email (kiểm tra trùng lặp NẾU email thay đổi)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Chỉ kiểm tra nếu email mới khác email hiện tại (không phân biệt hoa thường)
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                Users existingUserWithEmail = userRepo.findUserByEmail(newEmail);
                if (existingUserWithEmail != null && !existingUserWithEmail.getUserId().equals(userIdToUpdate)) {
                    throw new InvalidDataException("Email " + newEmail + " are used by other one.");
                }
                user.setEmail(newEmail);
            }
        }

        // Cập nhật Phone (kiểm tra trùng lặp NẾU phone thay đổi)
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String newPhone = request.getPhone().trim();
            // Chỉ kiểm tra nếu SĐT mới khác SĐT hiện tại
            if (!newPhone.equals(user.getPhone())) {
                Users existingUserWithPhone = userRepo.findByPhone(newPhone);
                // Nếu SĐT mới đã tồn tại VÀ nó không thuộc về chính user đang sửa
                if (existingUserWithPhone != null && !existingUserWithPhone.getUserId().equals(userIdToUpdate)) {
                    throw new InvalidDataException("Phone " + newPhone + " are used by other one.");
                }
                user.setPhone(newPhone);
            }
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        // Cập nhật Center (nếu có và user là STAFF/TECHNICIAN)
        if (request.getCenterId() != null && (user.getRole() == UserRole.STAFF || user.getRole() == UserRole.TECHNICIAN)) {
            ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));
            user.setCenter(center);
        } else if (user.getRole() == UserRole.CUSTOMER) {
            // Đảm bảo Customer không bị gán vào center
            user.setCenter(null);
        }

        Users updatedUser = userRepo.save(user);
        log.info("Admin {} updated user {} successfully", adminId, userIdToUpdate);
        return mapToUserManagementDTO(updatedUser);
    }

    /**
     * Xóa user
     */
    @Transactional
    public void deleteUser(Integer userId, Integer adminId) {
        log.info("Admin {} deleting user {}", adminId, userId);
        validateAdminRole(adminId);

        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() != UserRole.STAFF && user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.CUSTOMER) {
            throw new InvalidDataException("Can only delete STAFF or TECHNICIAN accounts or CUSTOMER accounts");
        }
        userRepo.delete(user);
        log.info("User {} deleted successfully", userId);
    }

    /**
     * Admin xem chi tiết booking bất kỳ bằng ID
     */
    public StaffBookingDTO getBookingById(Integer bookingId, Integer adminId) {
        log.info("Admin {} fetching booking details for booking ID: {}", adminId, bookingId);
        validateAdminRole(adminId); // Xác thực quyền Admin

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        return mapToStaffBookingDTO(booking);
    }

    /**
     * Admin xem chi tiết payment theo bookingId
     */
    public PaymentDTO getPaymentByBookingId(Integer bookingId, Integer adminId) {
        log.info("Admin {} fetching payment details for booking ID: {}", adminId, bookingId);
        validateAdminRole(adminId); // Xác thực quyền Admin

        Payment payment = paymentRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking ID: " + bookingId));
        return mapToPaymentDTO(payment);
    }

    /**
     * Lấy tất cả booking theo centerId
     */
    public List<StaffBookingDTO> getBookingsByCenter(Integer centerId, Integer adminId) {
        log.info("Admin {} fetching bookings for center {}", adminId, centerId);
        validateAdminRole(adminId);

        ServiceCenter center = serviceCenterRepo.findById(centerId)
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + centerId));

        List<Booking> bookings = bookingRepo.findByServiceCenter_IdOrderByBookingDateDesc(centerId);

        return bookings.stream()
                .map(this::mapToStaffBookingDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin xem tất cả booking trong hệ thống
     */
    public List<StaffBookingDTO> getAllBookings(Integer adminId) {
        log.info("Admin {} fetching all bookings in the system", adminId);
        validateAdminRole(adminId);
        List<Booking> allBookings = bookingRepo.findByOrderByBookingDateDesc();
        return allBookings.stream()
                .map(this::mapToStaffBookingDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin xem tất cả payment trong hệ thống
     */
    public List<PaymentDTO> getAllPayments(Integer adminId) {
        log.info("Admin {} fetching all payments in the system", adminId);
        validateAdminRole(adminId);

        List<Payment> allPayments = paymentRepo.findByOrderByPaymentDateDesc();

        return allPayments.stream()
                .map(this::mapToPaymentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin xem tất cả payment theo centerId
     */
    public List<PaymentDTO> getPaymentsByCenter(Integer centerId, Integer adminId) {
        log.info("Admin {} fetching payments for center {}", adminId, centerId);
        validateAdminRole(adminId);
        serviceCenterRepo.findById(centerId)
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + centerId));

        List<Payment> payments = paymentRepo.findByBooking_ServiceCenter_Id(centerId);

        return payments.stream()
                .map(this::mapToPaymentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin xem chi tiết checklist theo bookingId
     */
    public MaintenanceChecklistResponse getChecklistByBookingIdForAdmin(Integer bookingId, Integer adminId) {
        log.info("Admin {} fetching checklist details for booking ID: {}", adminId, bookingId);
        validateAdminRole(adminId); // Xác thực quyền Admin

        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for booking ID: " + bookingId));

        return checklistService.mapChecklistToResponseWithDetails(checklist);
    }


    /**
     * Lấy dữ liệu doanh thu cho Chart 1
     */
    public RevenueAnalyticsResponse getRevenueAnalytics(Integer month, Integer year, Integer centerId) {
        validateAdminRole(authService.getCurrentAccount().getUserId());
        List<Object[]> results;

        if (centerId == null) {
            // Lấy doanh thu TẤT CẢ center
            log.info("Fetching revenue analytics for all centers, month: {}, year: {}", month, year);
            results = paymentRepo.findRevenueByMonthAndYear(month, year);
        } else {
            // Lấy doanh thu 1 center (chia theo ngày)
            log.info("Fetching revenue analytics for center: {}, month: {}, year: {}", centerId, month, year);
            results = paymentRepo.findRevenueByCenterAndMonthAndYear(centerId, month, year);
        }

        List<String> labels = new ArrayList<>();
        List<BigDecimal> revenue = new ArrayList<>();

        for (Object[] result : results) {
            if (centerId == null) {
                labels.add((String) result[0]); // Tên trung tâm
                revenue.add((BigDecimal) result[1]); // Tổng doanh thu
            } else {
                labels.add("Ngày " + result[0]); // Ngày trong tháng
                revenue.add((BigDecimal) result[1]); // Tổng doanh thu
            }
        }

        if (labels.isEmpty()) {
            log.warn("No revenue data found");
        }

        return new RevenueAnalyticsResponse(labels, revenue);
    }

    /**
     * Lấy dữ liệu thống kê booking cho Chart 2
     */
    public BookingAnalyticsResponse getBookingAnalytics(Integer month, Integer year, Integer centerId) {
        validateAdminRole(authService.getCurrentAccount().getUserId());
        List<Object[]> results;

        if (centerId == null) {
            log.info("Fetching booking analytics for all centers, month: {}, year: {}", month, year);
            results = bookingRepo.findBookingStatsByMonthAndYear(month, year);
        } else {
            log.info("Fetching booking analytics for center: {}, month: {}, year: {}", centerId, month, year);
            results = bookingRepo.findBookingStatsByCenterAndMonthAndYear(centerId, month, year);
        }

        List<String> labels = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (Object[] result : results) {
            labels.add(((BookingStatus) result[0]).name());

            counts.add((Long) result[1]); // Số lượng
        }

        if (labels.isEmpty()) {
            log.warn("No booking stats data found");
        }

        return new BookingAnalyticsResponse(labels, counts);
    }

    /**
     * Lấy dữ liệu thống kê linh kiện cho Chart 3 (bắt buộc theo center)
     */
    public PartAnalyticsResponse getPartAnalytics(Integer centerId, Integer month, Integer year) {
        validateAdminRole(authService.getCurrentAccount().getUserId());
        log.info("Fetching part analytics for center: {}, month: {}, year: {}", centerId, month, year);

        List<Object[]> results = checklistDetailRepo.findPartUsageStatsByCenterAndMonthAndYear(
                centerId, month, year, ApprovalStatus.APPROVED //
        );

        List<String> labels = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (Object[] result : results) {
            labels.add((String) result[0]); // Tên linh kiện
            counts.add((Long) result[1]); // Số lượng
        }

        if (labels.isEmpty()) {
            log.warn("No part stats data found");
        }

        return new PartAnalyticsResponse(labels, counts);
    }

    /* active/ deactivate account
     * */
    @Transactional
    public UserManagementDTO activateUserAccount(Integer userId, Integer adminId, boolean isActive) {
        log.info("Admin {} activating user account {}", adminId, userId);
        validateAdminRole(adminId); // Xác thực quyền Admin

        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setIsActive(isActive);

        Users updatedUser = userRepo.save(user);
        log.info("Admin {} activated user {} successfully", adminId, userId);
        return mapToUserManagementDTO(updatedUser);
    }

    //delete account
    @Transactional
    public UserManagementDTO deactivateUserAccount(Integer userId, Integer adminId) {
        log.info("Admin {} deactivating user account {}", adminId, userId);
        validateAdminRole(adminId);
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        userRepo.delete(user);
        log.info("Admin {} deactivated user {} successfully", adminId, userId);
        return mapToUserManagementDTO(user);
    }
    // ==================== Private Helper Methods ====================

    private void validateAdminRole(Integer userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + userId));
        if (user.getRole() != UserRole.ADMIN) {
            throw new InvalidDataException("Only ADMIN can perform this action");
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
        boolean feedbackExists = feedbackRepository.existsByBooking_BookingId(booking.getBookingId());
        dto.setHasFeedback(feedbackExists);
        log.debug("Feedback exists for booking {}: {}", booking.getBookingId(), feedbackExists);
        return dto;
    }

}