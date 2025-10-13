package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.ServiceCenter;
import com.se1824.SWP391_FA25.entity.Users;
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

    /**
     * Tạo user mới (Staff hoặc Technician)
     */
    @Transactional
    public UserManagementDTO createUser(CreateUserRequest request, String adminId) {
        log.info("Admin {} creating user with prefix {}", adminId, request.getUserIdPrefix());

        // Validate admin
        validateAdminRole(adminId);

        // Validate prefix
        if (!"ST".equals(request.getUserIdPrefix()) && !"TE".equals(request.getUserIdPrefix())) {
            throw new InvalidDataException("User prefix must be ST or TE");
        }

        // Validate required fields
        validateUserRequest(request);

        // Check email unique
        if (userRepo.findUserByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email already exists: " + request.getEmail());
        }

        // Validate service center
        ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + request.getCenterId()));

        // Generate userId
        String userId = generateUserId(request.getUserIdPrefix());

        // Create user
        Users user = new Users();
        user.setUserId(userId);
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setServiceCenter(center);

        Users savedUser = userRepo.save(user);
        log.info("User created successfully with ID: {}", userId);

        return mapToUserManagementDTO(savedUser);
    }

    /**
     * Lấy danh sách Staff
     */
    public List<UserManagementDTO> getAllStaff(Integer centerId) {
        List<Users> staff;

        if (centerId != null) {
            staff = userRepo.findByServiceCenter_IdAndUserIdStartingWith(centerId, "ST");
        } else {
            staff = userRepo.findByUserIdStartingWith("ST");
        }

        return staff.stream()
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách Technician
     */
    public List<UserManagementDTO> getAllTechnicians(Integer centerId) {
        List<Users> technicians;

        if (centerId != null) {
            technicians = userRepo.findByServiceCenter_IdAndUserIdStartingWith(centerId, "TE");
        } else {
            technicians = userRepo.findByUserIdStartingWith("TE");
        }

        return technicians.stream()
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả users (trừ Admin)
     */
    public List<UserManagementDTO> getAllUsers() {
        List<Users> allUsers = userRepo.findAll();
        return allUsers.stream()
                .filter(u -> !u.getUserId().startsWith("AD")) // Không hiển thị Admin
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    /**
     * User tự update thông tin của mình (không có centerId)
     */
    @Autowired
    AuthenticationService authenticationService;

    @Transactional
    public UserManagementDTO updateOwnProfile(UpdateUserRequest request) {
        log.info("User {} updating own profile", authenticationService.getCurrentAccount().getUserId());

//        Users user = userRepo.findById(authenticationService.getCurrentAccount().getUserId());
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "User not found with ID: " + authenticationService.getCurrentAccount().getUserId()));
        Users user = authenticationService.getCurrentAccount();
        // Update fields (không cho đổi centerId)
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            Users existingUser = userRepo.findUserByEmail(request.getEmail());
            if (existingUser != null && !existingUser.getUserId().equals(user.getUserId())) {
                throw new InvalidDataException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone());
        }

        Users updatedUser = userRepo.save(user);
        log.info("User {} updated own profile successfully", authenticationService.getCurrentAccount().getUserId());

        return mapToUserManagementDTO(updatedUser);
    }

    /**
     * Admin update bất kỳ user nào (bao gồm centerId)
     */
    @Transactional
    public UserManagementDTO updateUserByAdmin(UpdateUserRequest request, String adminId) {
        log.info("Admin {} updating user {}", adminId, authenticationService.getCurrentAccount().getUserId());

        // Validate admin
        validateAdminRole(adminId);

        Users user = userRepo.findById(authenticationService.getCurrentAccount().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + authenticationService.getCurrentAccount().getUserId()));

        // Admin có thể update tất cả (trừ userId vì là PK)
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            Users existingUser = userRepo.findUserByEmail(request.getEmail());
            if (existingUser != null && !existingUser.getUserId().equals(user.getUserId())) {
                throw new InvalidDataException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone());
        }

        // Chỉ admin mới được đổi centerId
        if (request.getCenterId() != null) {
            ServiceCenter center = serviceCenterRepo.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Service center not found with ID: " + request.getCenterId()));
            user.setServiceCenter(center);
        }

        Users updatedUser = userRepo.save(user);
        log.info("Admin updated user {} successfully", authenticationService.getCurrentAccount().getUserId());

        return mapToUserManagementDTO(updatedUser);
    }

    /**
     * Xóa user
     */
    @Transactional
    public void deleteUser(String userId, String adminId) {
        log.info("Admin {} deleting user {}", adminId, userId);

        // Validate admin
        validateAdminRole(adminId);

        // Validate user exists
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        // Chỉ cho phép xóa ST hoặc TE
        if (!user.getUserId().startsWith("ST") && !user.getUserId().startsWith("TE")) {
            throw new InvalidDataException("Can only delete staff or technician accounts");
        }

        // Hard delete
        userRepo.delete(user);
        log.info("User {} deleted successfully", userId);
    }

    // ==================== Private Helper Methods ====================

    private void validateAdminRole(String userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        if (!user.getUserId().startsWith("AD")) {
            throw new InvalidDataException("Only admin can perform this action");
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

    private String generateUserId(String prefix) {
        // Tìm userId cuối cùng với prefix này
        List<Users> users = userRepo.findByUserIdStartingWith(prefix);

        if (users.isEmpty()) {
            return prefix + "001";
        }

        // Lấy số lớn nhất
        int maxNumber = users.stream()
                .map(u -> {
                    try {
                        return Integer.parseInt(u.getUserId().substring(2));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .max(Integer::compareTo)
                .orElse(0);

        int nextNumber = maxNumber + 1;
        return prefix + String.format("%03d", nextNumber);
    }

    private UserManagementDTO mapToUserManagementDTO(Users user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());

        // Set role based on prefix
        if (user.getUserId().startsWith("CU")) {
            dto.setRole("CUSTOMER");
        } else if (user.getUserId().startsWith("ST")) {
            dto.setRole("STAFF");
        } else if (user.getUserId().startsWith("TE")) {
            dto.setRole("TECHNICIAN");
        } else if (user.getUserId().startsWith("AD")) {
            dto.setRole("ADMIN");
        }

        if (user.getServiceCenter() != null) {
            dto.setCenterId(user.getServiceCenter().getId());
            dto.setCenterName(user.getServiceCenter().getName());
        }

        return dto;
    }
}