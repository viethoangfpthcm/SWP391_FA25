package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.ChecklistDetailUpdateRequest;
import com.se1824.SWP391_FA25.model.response.AssignedBookingTechnicianResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistSummaryResponse; // <-- THÊM IMPORT NÀY
import com.se1824.SWP391_FA25.service.MaintenanceChecklistService;
import com.se1824.SWP391_FA25.service.TechnicianService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SecurityRequirement(name = "api")
@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TechnicianController {
    private final TechnicianService technicianService;
    private final MaintenanceChecklistService checklistService;

    /**
     * Lấy danh sách các Booking đã được gán (Assigned) cho Kỹ thuật viên hiện tại.
     * trước khi tạo Checklist.
     *
     * @return ResponseEntity chứa danh sách AssignedBookingTechnicianResponse.
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<AssignedBookingTechnicianResponse>> getAssignedBookings() {
        List<AssignedBookingTechnicianResponse> responseList = technicianService.getAssignedBookings();
        return ResponseEntity.ok(responseList);
    }


    /**
     * Lấy danh sách các Maintenance Checklist (Bảng kiểm tra bảo dưỡng) hiện có
     * và đang được xử lý bởi Kỹ thuật viên đang đăng nhập (TRẢ VỀ TÓM TẮT).
     *
     * @return ResponseEntity chứa danh sách MaintenanceChecklistSummaryResponse.
     */
    @GetMapping("/my-checklists")
    public ResponseEntity<List<MaintenanceChecklistSummaryResponse>> getMyChecklistsSummary() {
        List<MaintenanceChecklistSummaryResponse> responseList = checklistService.getChecklistByCurrentTechnicianSummary();
        return ResponseEntity.ok(responseList);
    }


    /**
     * Bắt đầu quy trình bảo dưỡng (Maintenance Start) cho một Booking cụ thể.
     * Hàm này thường tạo ra một Maintenance Checklist mới dựa trên Booking và lịch bảo dưỡng của xe.
     *
     * @return ResponseEntity với thông báo thành công.
     */
    @PostMapping("/start/{bookingId}")
    public ResponseEntity<String> startMaintenance(@PathVariable Integer bookingId, @RequestParam Integer actualKm) {
        checklistService.startMaintenance(bookingId, actualKm);
        return ResponseEntity.ok("Maintenance started for booking ID: " + bookingId);
    }
    /**
     * Cập nhật chi tiết một hạng mục (detail) trong Maintenance Checklist.
     * * Endpoint: PUT /api/technician/detail/{detailId}
     * @param detailId       ID của chi tiết Checklist cần cập nhật.
     * @param request        Request Body chứa status, note, partId.
     * @return ResponseEntity với thông báo cập nhật thành công.
     */
    @PutMapping("/update-detail/{detailId}")
    public ResponseEntity<String> updateChecklistDetail(
            @PathVariable Integer detailId,
            @RequestBody ChecklistDetailUpdateRequest request //
    ) {
        checklistService.updateChecklistDetail(detailId, request);
        return ResponseEntity.ok("Checklist detail updated successfully");
    }

    /**
     * API để Technician đánh dấu Checklist đã hoàn thành.
     * Logic trừ Part sẽ được thực hiện bên trong service.
     */
    @PostMapping("/{checklistId}/complete")
    public ResponseEntity<String> completeChecklist(@PathVariable Integer checklistId) {
        try {
            checklistService.completeChecklist(checklistId);
            return ResponseEntity.ok("Checklist for ID " + checklistId + " completed successfully. Part inventory updated.");

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (InvalidDataException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * Lấy chi tiết checklist cụ thể cho khách hàng theo bookingId (API DETAIL).
     *
     * @param bookingId ID booking
     * @return chi tiết checklist
     */
    @GetMapping("/my-checklists/{bookingId}")
    public ResponseEntity<MaintenanceChecklistResponse> getChecklistDetailForTechnician(@PathVariable Integer bookingId) {
        MaintenanceChecklistResponse response = checklistService.getChecklistByTechnicianAndBookingId(bookingId);
        return ResponseEntity.ok(response);
    }
}