package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.ServiceCenter;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.CreateUserRequest;
import com.se1824.SWP391_FA25.model.request.UpdateUserRequest;
import com.se1824.SWP391_FA25.repository.ServiceCenterRepository;
import com.se1824.SWP391_FA25.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Tạo user mới (Staff hoặc Technician)
     */
    @Transactional
    public UserManagementDTO createUser(CreateUserRequest request, Integer adminId) {
        log.info("Admin {} creating user with role {}", adminId, request.getRole());
        validateAdminRole(adminId);

        if (request.getRole() != UserRole.STAFF && request.getRole() != UserRole.TECHNICIAN) {
            throw new InvalidDataException("Can only create STAFF or TECHNICIAN roles.");
        }
        validateUserRequest(request);

        if (userRepo.findUserByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email already exists: " + request.getEmail());
        }

        ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));

        Users user = new Users();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCenter(center);
        user.setRole(request.getRole()); // Gán vai trò từ request
        user.setIsActive(true);

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
     * User tự update thông tin của mình (không có centerId)
     */
    @Autowired
    AuthenticationService authenticationService;


    /**
     * Admin update bất kỳ user nào (bao gồm centerId)
     */
    @Transactional
    public UserManagementDTO updateUserByAdmin(UpdateUserRequest request, Integer adminId, Integer userIdToUpdate) {
        log.info("Admin {} updating user {}", adminId, userIdToUpdate);
        validateAdminRole(adminId);

        Users user = userRepo.findById(userIdToUpdate)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userIdToUpdate));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        if (request.getCenterId() != null) {
            ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service center not found with ID: " + request.getCenterId()));
            user.setCenter(center);
        }

        Users updatedUser = userRepo.save(user);
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

    // ==================== Private Helper Methods ====================

    private void validateAdminRole(Integer userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + userId));
        if (user.getRole() != UserRole.ADMIN) {
            throw new InvalidDataException("Only ADMIN can perform this action");
        }
    }

    private void validateUserRequest(CreateUserRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new InvalidDataException("Full name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new InvalidDataException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new InvalidDataException("Password must be at least 6 characters");
        }
        if (request.getCenterId() == null) {
            throw new InvalidDataException("Service center is required");
        }
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