package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.CustomerInfoDTO;
import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.service.AccountService;

import jakarta.validation.Valid;
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


    private final AccountService accountService;

    /**
     * User tự update profile (không có centerId)
     * PUT /api/users/profile
     */
    @PutMapping("/update-profile")
    public ResponseEntity<UserManagementDTO> updateOwnProfile(
           @Valid @RequestBody UpdateUserRequest request) {
        UserManagementDTO user = accountService.updateOwnProfile(request);
        return ResponseEntity.ok(user);
    }
    /**
     * Lấy thông tin profile của chính người dùng đã đăng nhập.
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<CustomerInfoDTO> getOwnProfile() {
        CustomerInfoDTO userProfile = accountService.getOwnProfile();
        return ResponseEntity.ok(userProfile);
    }

}