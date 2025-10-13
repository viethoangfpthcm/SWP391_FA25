package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.MaintenanceChecklistService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@SecurityRequirement(name = "api")
@CrossOrigin(origins = "*")
public class MaintenanceChecklistController {
    MaintenanceChecklistService checklistService;

    //  Lấy checklist theo customer
//    @GetMapping("/customer/{customerId}")
//    public ResponseEntity<List<MaintenanceChecklistResponse>> getByCustomer() {
//        return ResponseEntity.ok(checklistService.getChecklistByCustomer());
//    }

    // Lấy checklist của technician đang đăng nhập
    @GetMapping("/technician/my-checklists")
    public ResponseEntity<List<MaintenanceChecklistResponse>> getMyChecklists() {
        List<MaintenanceChecklistResponse> responseList = checklistService.getChecklistByCurrentTechnician();
        return ResponseEntity.ok(responseList);
    }

    //  Technician start maintenance (bắt đầu bảo trì)
    @PostMapping("/start/{bookingId}")
    public ResponseEntity<String> startMaintenance(@PathVariable Integer bookingId) {
        checklistService.startMaintenance(bookingId);
        return ResponseEntity.ok("Maintenance started for booking ID: " + bookingId);
    }

    //  Cập nhật chi tiết checklist (Technician update từng mục)
    @PutMapping("/detail/{detailId}")
    public ResponseEntity<String> updateChecklistDetail(
            @PathVariable Integer detailId,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) Integer partId,
            Authentication authentication
    ) {
        Users currentUser = (Users) authentication.getPrincipal();
        String currentUserId = currentUser.getUserId();

        checklistService.updateChecklistDetail(detailId, status, note, partId, currentUserId);
        return ResponseEntity.ok("Checklist detail updated successfully");
    }
}
