package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.model.request.*;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.service.AdminService;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.FeedbackService;
import com.se1824.SWP391_FA25.service.ServiceCenterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "api")
public class AdminController {

    private final AdminService adminService;
    private final AuthenticationService authenticationService;
    private final ServiceCenterService serviceCenterService;


    /**
     * Tạo user mới (Staff hoặc Technician)
     * POST /api/admin/users?adminId={adminId}
     */
    @PostMapping("/users-create")
    public ResponseEntity<UserManagementDTO> createUser(@Valid
                                                        @RequestBody CreateUserRequest request) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        UserManagementDTO user = adminService.createUser(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Lấy danh sách Staff
     * GET /api/admin/staff?centerId={centerId}
     */
    @GetMapping("/staff")
    public ResponseEntity<List<UserManagementDTO>> getAllStaff(
            @RequestParam(required = false) Integer centerId) {
        List<UserManagementDTO> staff = adminService.getAllStaff(centerId);
        return ResponseEntity.ok(staff);
    }

    /**
     * Lấy danh sách Technician
     * GET /api/admin/technicians?centerId={centerId}
     */
    @GetMapping("/technicians")
    public ResponseEntity<List<UserManagementDTO>> getAllTechnicians(
            @RequestParam(required = false) Integer centerId) {
        List<UserManagementDTO> technicians = adminService.getAllTechnicians(centerId);
        return ResponseEntity.ok(technicians);
    }

    /**
     * Lấy tất cả users trong hệ thống (trừ Admin)
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        List<UserManagementDTO> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Admin update user (có thể đổi centerId)
     * PUT /api/admin/users?adminId={adminId}
     */
    @PutMapping("/users-update")
    public ResponseEntity<UserManagementDTO> updateUserByAdmin(
            @Valid @RequestBody UpdateUserRequest request,
            @RequestParam Integer userIdToUpdate
    ) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        UserManagementDTO user = adminService.updateUserByAdmin(request, adminId, userIdToUpdate);
        return ResponseEntity.ok(user);
    }

    /**
     * Xóa user
     * DELETE /api/admin/users/{userId}?adminId={adminId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Integer userId) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        adminService.deleteUser(userId, adminId);
        return ResponseEntity.noContent().build();
    }

    /**
     * CREATE: Thêm một ServiceCenter mới
     * POST /api/admin/service-centers
     */
    @PostMapping("/service-centers")
    public ResponseEntity<ServiceCenter> createServiceCenter(
            @Valid @RequestBody ServiceCenterRequest request
    ) {
        ServiceCenter newCenter = serviceCenterService.createServiceCenter(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCenter);
    }

    /**
     * READ (All): Lấy tất cả các ServiceCenter
     * GET /api/admin/service-centers
     */
    @GetMapping("/service-centers")
    public ResponseEntity<List<ServiceCenter>> getAllServiceCenters() {
        List<ServiceCenter> centers = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(centers);
    }

    /**
     * READ (One): Lấy thông tin ServiceCenter theo ID
     * GET /api/admin/service-centers/{id}
     */
    @GetMapping("/service-centers/{id}")
    public ResponseEntity<ServiceCenter> getServiceCenterById(@PathVariable Integer id) {
        ServiceCenter center = serviceCenterService.getServiceCenterById(id);
        return ResponseEntity.ok(center);
    }

    /**
     * UPDATE: Cập nhật thông tin ServiceCenter
     * PUT /api/admin/service-centers/{id}
     */
    @PutMapping("/service-centers/{id}")
    public ResponseEntity<ServiceCenter> updateServiceCenter(
            @PathVariable Integer centerId,
            @Valid @RequestBody ServiceCenterRequest requestDTO
    ) {
        ServiceCenter updatedCenter = serviceCenterService.updateServiceCenter(centerId, requestDTO);
        return ResponseEntity.ok(updatedCenter);
    }

    /**
     * DELETE: Xóa một ServiceCenter
     * DELETE /api/admin/service-centers/{id}
     */
    @DeleteMapping("/service-centers/{id}")
    public ResponseEntity<Void> deleteServiceCenter(@PathVariable Integer id) {
        serviceCenterService.deleteServiceCenter(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy TẤT CẢ Part (phụ tùng) thuộc về một ServiceCenter
     * GET /api/admin/service-centers/{centerId}/parts
     */
    @GetMapping("/service-centers/{centerId}/parts")
    public ResponseEntity<List<Part>> getPartsByCenter(@PathVariable Integer centerId) {
        List<Part> parts = serviceCenterService.getPartsByServiceCenter(centerId);
        return ResponseEntity.ok(parts);
    }

    /**
     * Tạo một Part (phụ tùng) MỚI cho một ServiceCenter
     * POST /service-centers/{centerId}/parts
     */
    @PostMapping("/service-centers/{centerId}/parts")
    public ResponseEntity<Part> createPartForCenter(
            @PathVariable Integer centerId,
            @Valid @RequestBody PartCreateRequest request) {

        // Yêu cầu Service tạo Part từ DTO và centerId
        Part newPart = serviceCenterService.createPart(request, centerId);
        return new ResponseEntity<>(newPart, HttpStatus.CREATED);
    }

    /**
     * DELETE: Xóa một Part (phụ tùng)
     * DELETE /api/admin/parts/{partId}
     */
    @DeleteMapping("/parts/{partId}")
    public ResponseEntity<Void> deletePart(@PathVariable Integer partId) {
        serviceCenterService.deletePart(partId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy chi tiết một Part theo ID
     * GET /api/admin/parts/{partId}
     */
    @GetMapping("/parts/{partId}")
    public ResponseEntity<Part> getPartById(@PathVariable Integer partId) {
        Part part = serviceCenterService.getPartById(partId);
        return ResponseEntity.ok(part);
    }

    /**
     * Cập nhật thông tin một Part
     * PUT /api/admin/parts/{partId}
     */
    @PutMapping("/parts/{partId}")
    public ResponseEntity<Part> updatePart(
            @PathVariable Integer partId,
            @Valid @RequestBody PartCreateRequest requestDTO) {

        Part updatedPart = serviceCenterService.updatePart(partId, requestDTO);
        return new ResponseEntity<>(updatedPart, HttpStatus.OK);
    }

    /**
     * READ (All): Lấy tất cả PartType (cho dropdown)
     * GET /api/admin/part-types
     */
    @GetMapping("/part-types")
    public ResponseEntity<List<PartType>> getAllPartTypes() {
        List<PartType> partTypes = serviceCenterService.getAllPartTypes();
        return ResponseEntity.ok(partTypes);
    }

    /**
     * READ (One): Lấy chi tiết PartType
     * GET /api/admin/part-types/{id}
     */
    @GetMapping("/part-types/{id}")
    public ResponseEntity<PartType> getPartTypeById(@PathVariable Integer id) {
        PartType partType = serviceCenterService.getPartTypeById(id);
        return ResponseEntity.ok(partType);
    }

    /**
     * UPDATE: Cập nhật PartType
     * PUT /api/admin/part-types/{id}
     */
    @PutMapping("/part-types/{id}")
    public ResponseEntity<PartType> updatePartType(@PathVariable Integer id, @RequestBody PartType partTypeDetails) {
        PartType updatedType = serviceCenterService.updatePartType(id, partTypeDetails);
        return ResponseEntity.ok(updatedType);
    }

    /**
     * Admin xem chi tiết booking bất kỳ (trả về DTO)
     * GET /api/admin/bookings/{bookingId}
     */
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<StaffBookingDTO> getBookingDetails(
            @PathVariable Integer bookingId) {

        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        StaffBookingDTO bookingDTO = adminService.getBookingById(bookingId, adminId);
        return ResponseEntity.ok(bookingDTO);
    }

    /**
     * Admin xem chi tiết payment theo bookingId (trả về DTO)
     * GET /api/admin/payments/booking/{bookingId}
     */
    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<PaymentDTO> getPaymentDetailsByBooking(
            @PathVariable Integer bookingId) {

        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        PaymentDTO paymentDTO = adminService.getPaymentByBookingId(bookingId, adminId);
        return ResponseEntity.ok(paymentDTO);
    }

    /**
     * Admin xem tất cả booking trong hệ thống
     * GET /api/admin/bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<StaffBookingDTO>> getAllBookings() {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        List<StaffBookingDTO> allBookings = adminService.getAllBookings(adminId);
        return ResponseEntity.ok(allBookings);
    }

    /**
     * Admin xem tất cả booking theo Center ID
     * GET /api/admin/bookings/by-center/{centerId}
     */
    @GetMapping("/bookings/by-center/{centerId}")
    public ResponseEntity<List<StaffBookingDTO>> getBookingsByCenter(
            @PathVariable Integer centerId) {

        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        List<StaffBookingDTO> bookings = adminService.getBookingsByCenter(centerId, adminId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Admin xem tất cả payment trong hệ thống
     * GET /api/admin/payments
     */
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {

        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        List<PaymentDTO> allPayments = adminService.getAllPayments(adminId);
        return ResponseEntity.ok(allPayments);
    }

    /**
     * Admin xem tất cả payment theo Center ID
     * GET /api/admin/payments/by-center/{centerId}
     */
    @GetMapping("/payments/by-center/{centerId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByCenter(
            @PathVariable Integer centerId) {

        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        List<PaymentDTO> payments = adminService.getPaymentsByCenter(centerId, adminId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Admin xem chi tiết checklist theo bookingId (bao gồm all details)
     * GET /api/admin/checklists/booking/{bookingId}
     */
    @GetMapping("/checklists/booking/{bookingId}")
    public ResponseEntity<MaintenanceChecklistResponse> getChecklistDetailsByBooking(
            @PathVariable Integer bookingId) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        MaintenanceChecklistResponse checklistResponse = adminService.getChecklistByBookingIdForAdmin(bookingId, adminId);

        return ResponseEntity.ok(checklistResponse);
    }

    /**
     * CHART 1: Lấy doanh thu TẤT CẢ center
     * GET /api/admin/analytics/revenue
     */
    @GetMapping("/analytics/revenue")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenueAnalytics(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        RevenueAnalyticsResponse data = adminService.getRevenueAnalytics(month, year, null);

        if (data.getLabels() == null || data.getLabels().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
        }
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 1: Lấy doanh thu MỘT center
     * GET /api/admin/analytics/revenue/center/{centerId}
     */
    @GetMapping("/analytics/revenue/center/{centerId}")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenueAnalyticsByCenter(
            @PathVariable Integer centerId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        RevenueAnalyticsResponse data = adminService.getRevenueAnalytics(month, year, centerId);

        if (data.getLabels() == null || data.getLabels().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
        }
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 2: Lấy thống kê booking TẤT CẢ center
     * GET /api/admin/analytics/bookings
     */
    @GetMapping("/analytics/bookings")
    public ResponseEntity<BookingAnalyticsResponse> getBookingAnalytics(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        BookingAnalyticsResponse data = adminService.getBookingAnalytics(month, year, null);

        if (data.getLabels() == null || data.getLabels().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
        }
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 2: Lấy thống kê booking MỘT center
     * GET /api/admin/analytics/bookings/center/{centerId}
     */
    @GetMapping("/analytics/bookings/center/{centerId}")
    public ResponseEntity<BookingAnalyticsResponse> getBookingAnalyticsByCenter(
            @PathVariable Integer centerId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        BookingAnalyticsResponse data = adminService.getBookingAnalytics(month, year, centerId);

        if (data.getLabels() == null || data.getLabels().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
        }
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 3: Lấy thống kê linh kiện (Bắt buộc theo center)
     * GET /api/admin/analytics/parts
     */
    @GetMapping("/analytics/parts")
    public ResponseEntity<PartAnalyticsResponse> getPartAnalytics(
            @RequestParam Integer centerId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        PartAnalyticsResponse data = adminService.getPartAnalytics(centerId, month, year);

        if (data.getLabels() == null || data.getLabels().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
        }
        return ResponseEntity.ok(data);
    }

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/analytics/feedbacks/{centerId}")
    public ResponseEntity<?> getPublishedFeedbacksByCenter(@PathVariable Integer centerId) {
        try {
            FeedbackStatsDTO stats = feedbackService.getFeedbackStatsByCenter(centerId);
            return ResponseEntity.ok(stats); // Trả về DTO này
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/user/active")
    public ResponseEntity<?> userActiveStatus(
            @RequestParam Integer userId,
            @RequestParam Boolean isActive) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        adminService.activateUserAccount(userId, adminId, isActive);
        String status = isActive ? "activated" : "deactivated";
        return ResponseEntity.ok("User with ID " + userId + " has been " + status + " successfully.");
    }
}