package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@SecurityRequirement(name = "api")

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final AdminService adminService;

    /**
     * User tự update profile (không có centerId)
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserManagementDTO> updateOwnProfile(
            @RequestBody UpdateUserRequest request) {
        UserManagementDTO user = adminService.updateOwnProfile(request);
        return ResponseEntity.ok(user);
    }
}