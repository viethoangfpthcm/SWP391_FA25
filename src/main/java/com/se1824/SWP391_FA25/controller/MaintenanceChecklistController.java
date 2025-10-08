package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.service.MaintenanceChecklistService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MaintenanceChecklistController {
    MaintenanceChecklistService checklistService;
    //  Lấy checklist theo customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<MaintenanceChecklist>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(checklistService.getChecklistByCustomer(customerId));
    }

    // Lấy checklist theo technician
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<MaintenanceChecklist>> getByTechnician(@PathVariable String technicianId) {
        return ResponseEntity.ok(checklistService.getChecklistByTechnician(technicianId));
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
            @RequestParam(required = false) String note
    ) {
        checklistService.updateChecklistDetail(detailId, status, note);
        return ResponseEntity.ok("Checklist detail updated successfully");
    }
}
