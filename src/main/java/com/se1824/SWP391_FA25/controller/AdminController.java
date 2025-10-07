package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.model.request.CreateUserRequest;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.service.AdminService;
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
public class AdminController {

    private final AdminService adminService;

    /**
     * Tạo user mới (Staff hoặc Technician)
     * POST /api/admin/users?adminId={adminId}
     */
    @PostMapping("/users")
    public ResponseEntity<UserManagementDTO> createUser(@Valid
                                                        @RequestBody CreateUserRequest request,
                                                        @RequestParam String adminId) {
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
    @PutMapping("/users")
    public ResponseEntity<UserManagementDTO> updateUserByAdmin(
            @RequestBody UpdateUserRequest request,
            @RequestParam String adminId) {
        UserManagementDTO user = adminService.updateUserByAdmin(request, adminId);
        return ResponseEntity.ok(user);
    }

    /**
     * Xóa user
     * DELETE /api/admin/users/{userId}?adminId={adminId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable String userId,
            @RequestParam String adminId) {
        adminService.deleteUser(userId, adminId);
        return ResponseEntity.ok("User deleted successfully");
    }
}