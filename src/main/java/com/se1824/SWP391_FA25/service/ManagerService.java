package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.UserManagementDTO;
import com.se1824.SWP391_FA25.entity.Part;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.repository.PartRepository;
import com.se1824.SWP391_FA25.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerService {
    @Autowired
    PartRepository partRepo;
    @Autowired
    AuthenticationService auth;
    @Autowired
    UserRepository userRepo;


    /*
     * Lấy part theo centerId mà Manager đang làm việc
     * */
    public List<Part> getAllPart() {
        Users user = auth.getCurrentAccount();
        if (user.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }

        return partRepo.findByServiceCenterIdWithPartType(user.getCenter().getId());
    }

    /*
     * Lấy danh sách staff và technician của center
     * */
    public List<UserManagementDTO> getAllUsers() {
        Users user = auth.getCurrentAccount();
        if (user.getRole() != UserRole.MANAGER) {
            throw new InvalidDataException("Only MANAGER can perform this action");
        }

        return userRepo.findAll()
                .stream()
                .filter(u -> (u.getRole() == UserRole.TECHNICIAN || u.getRole() == UserRole.STAFF) && u.getCenter().getId().equals(user.getCenter().getId()))
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
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

}
