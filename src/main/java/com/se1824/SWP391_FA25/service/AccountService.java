package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.CustomerInfoDTO;
import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;

import com.se1824.SWP391_FA25.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
public class AccountService {
    private final UserRepository userRepo;
    private final AuthenticationService authService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Update thông tin người đăng nhập hiện tại (profile của chính họ).
     */
    @Transactional
    public UserManagementDTO updateOwnProfile(UpdateUserRequest request) {
        Users currentUser = authService.getCurrentAccount();
        log.info("User {} updating own profile", currentUser.getUserId());

        Users user = userRepo.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }
     // kiểm tra email mới có khác email hiện tại không
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {

            if (!request.getEmail().equalsIgnoreCase(user.getEmail())) {
                // Kiểm tra email đã tồn tại trong hệ thống chưa
                if (userRepo.findUserByEmail(request.getEmail()) != null) {
                    throw new InvalidDataException("Email " + request.getEmail() + " already exists.");
                }
                user.setEmail(request.getEmail());
            }
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        Users updatedUser = userRepo.save(user);
        log.info("User {} updated own profile successfully", updatedUser.getUserId());
        return mapToUserManagementDTO(updatedUser);
    }
    /**
     * Lấy thông tin profile của người dùng đang đăng nhập.
     */
    public CustomerInfoDTO getOwnProfile() {
        Users currentUser = authService.getCurrentAccount();
        log.info("User {} retrieving own profile", currentUser.getUserId());
        CustomerInfoDTO dto = new CustomerInfoDTO();
        dto.setUserId(currentUser.getUserId());
        dto.setFullName(currentUser.getFullName());
        dto.setEmail(currentUser.getEmail());
        dto.setPhone(currentUser.getPhone());

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
        return dto;
    }
}
