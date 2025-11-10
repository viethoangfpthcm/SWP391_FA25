package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.CustomerInfoDTO;
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
    private final ServiceCenterRepository serviceCenterRepo;

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

    @Transactional
    public UserManagementDTO createUser(CreateUserRequest request, Integer adminId) {

        if (request.getRole() != UserRole.STAFF && request.getRole() != UserRole.TECHNICIAN && request.getRole() != UserRole.CUSTOMER && request.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Can only create STAFF or TECHNICIAN or CUSTOMER roles.");
        }

        if (userRepo.findUserByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email already exists: " + request.getEmail());
        }
        if (userRepo.findByPhone(request.getPhone()) != null) {
            throw new InvalidDataException("Phone already exists: " + request.getPhone());
        }
        Users user = new Users();
        if (request.getRole() == UserRole.STAFF || request.getRole() == UserRole.TECHNICIAN || request.getRole() == UserRole.MANAGER) {
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

    @Transactional
    public UserManagementDTO updateUser(UpdateUserRequest request, Integer adminId, Integer userIdToUpdate) {


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

        // Cập nhật Center (nếu có và user là STAFF/TECHNICIAN/MANAGER)
        if (request.getCenterId() != null && (user.getRole() == UserRole.STAFF || user.getRole() == UserRole.TECHNICIAN || user.getRole() == UserRole.MANAGER)) {
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

    @Transactional
    public UserManagementDTO activateUserAccount(Integer userId, Integer adminId, boolean isActive) {
        log.info("Admin {} activating user account {}", adminId, userId);


        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setIsActive(isActive);

        Users updatedUser = userRepo.save(user);
        log.info("Admin {} change activation of user {} successfully", adminId, userId);
        return mapToUserManagementDTO(updatedUser);
    }

    //=======================================================================================
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
