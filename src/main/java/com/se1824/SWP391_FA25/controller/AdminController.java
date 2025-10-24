package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.model.request.AssignTechnicianRequest;
import com.se1824.SWP391_FA25.model.request.CreateUserRequest;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.service.AdminService;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.ServiceCenterService;
import com.se1824.SWP391_FA25.service.StaffService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
            @RequestBody UpdateUserRequest request,
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
    public ResponseEntity<String> deleteUser(
            @PathVariable Integer userId) {
        Integer adminId = authenticationService.getCurrentAccount().getUserId();
        adminService.deleteUser(userId, adminId);
        return ResponseEntity.ok("User deleted successfully");
    }

    /**
     * CREATE: Thêm một ServiceCenter mới
     * POST /api/admin/service-centers
     */
    @PostMapping("/service-centers")
    public ResponseEntity<ServiceCenter> createServiceCenter(@RequestBody ServiceCenter serviceCenter) {
        ServiceCenter newCenter = serviceCenterService.createServiceCenter(serviceCenter);
        return new ResponseEntity<>(newCenter, HttpStatus.CREATED);
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
    public ResponseEntity<ServiceCenter> updateServiceCenter(@PathVariable Integer id, @RequestBody ServiceCenter centerDetails) {
        ServiceCenter updatedCenter = serviceCenterService.updateServiceCenter(id, centerDetails);
        return ResponseEntity.ok(updatedCenter);
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
     * POST /api/admin/service-centers/{centerId}/parts
     */
    @PostMapping("/api/admin/service-centers/{centerId}/parts")
    public ResponseEntity<Part> createPartForCenter(
            @PathVariable Integer centerId,
            @RequestBody PartCreateRequest request) {

        // Yêu cầu Service tạo Part từ DTO và centerId
        Part newPart = serviceCenterService.createPart(request, centerId);
        return new ResponseEntity<>(newPart, HttpStatus.CREATED);
    }
    /**
     * Lấy TẤT CẢ Booking thuộc về một ServiceCenter
     * GET /api/admin/service-centers/{centerId}/bookings
     */
    @GetMapping("/service-centers/{centerId}/bookings")
    public ResponseEntity<List<Booking>> getBookingsByCenter(@PathVariable Integer centerId) {
        List<Booking> bookings = serviceCenterService.getBookingsByServiceCenter(centerId);
        return ResponseEntity.ok(bookings);
    }
    /**
     * Lấy Booking của ServiceCenter THEO TRẠNG THÁI
     * GET /api/admin/service-centers/{centerId}/bookings/search?status=PENDING
     */
    @GetMapping("/service-centers/{centerId}/bookings/search")
    public ResponseEntity<List<Booking>> getBookingsByCenterAndStatus(
            @PathVariable Integer centerId,
            @RequestParam String status) {
        List<Booking> bookings = serviceCenterService.getBookingsByServiceCenterAndStatus(centerId, status);
        return ResponseEntity.ok(bookings);
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
            @RequestBody PartCreateRequest requestDTO) {

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
     * READ (One): Lấy thông tin Payment theo ID
     * GET /api/admin/payments/{paymentId}
     */
    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Integer paymentId) {
        Payment payment = serviceCenterService.getPaymentById(paymentId);
        return ResponseEntity.ok(payment);
    }
    /**
     * READ (List by ServiceCenter): Lấy danh sách Payment theo ServiceCenter
     * GET /api/admin/service-centers/{centerId}/payments
     */
    @GetMapping("/service-centers/{centerId}/payments")
    public ResponseEntity<List<Payment>> getPaymentsByServiceCenter(@PathVariable Integer centerId) {
        List<Payment> payments = serviceCenterService.getPaymentsByServiceCenter(centerId);
        return ResponseEntity.ok(payments);
    }
    /**
     * READ (One by Booking): Lấy Payment bằng Booking ID
     * GET /api/admin/bookings/{bookingId}/payment
     */
    @GetMapping("/bookings/{bookingId}/payment")
    public ResponseEntity<Payment> getPaymentByBookingId(@PathVariable Integer bookingId) {
        Payment payment = serviceCenterService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(payment);
    }






}