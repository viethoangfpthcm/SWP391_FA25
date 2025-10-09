package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
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
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<MaintenanceChecklistResponse>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(checklistService.getChecklistByCustomer(customerId));
    }

    // Lấy checklist theo technician
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<MaintenanceChecklistResponse>> getByTechnicianWithVehicle(@PathVariable String technicianId) {
        List<MaintenanceChecklistResponse> responseList = checklistService.getChecklistByTechnicianWithVehicle(technicianId);
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
            AuthenticationService authentication
    ) {
        String currentUserId = authentication.getCurrentAccount().getUserId();
        checklistService.updateChecklistDetail(detailId, status, note, partId, currentUserId);
        return ResponseEntity.ok("Checklist detail updated successfully");
    }
}
