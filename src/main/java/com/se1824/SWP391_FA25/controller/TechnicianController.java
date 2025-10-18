package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.response.AssignedBookingTechnicianResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
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
     * và đang được xử lý bởi Kỹ thuật viên đang đăng nhập.
     *
     * @return ResponseEntity chứa danh sách MaintenanceChecklistResponse.
     */
    @GetMapping("/my-checklists")
    public ResponseEntity<List<MaintenanceChecklistResponse>> getMyChecklists() {
        List<MaintenanceChecklistResponse> responseList = checklistService.getChecklistByCurrentTechnician();
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
     * Đây là API Kỹ thuật viên sử dụng để ghi nhận trạng thái kiểm tra, ghi chú và chọn phụ tùng.
     * <p>
     * Endpoint: PUT /api/technician/detail/{detailId}
     *
     * @param detailId       ID của chi tiết Checklist cần cập nhật.
     * @param status         Trạng thái mới của hạng mục
     * @param note           Ghi chú của Kỹ thuật viên
     * @param partId         ID của phụ tùng được chọn để thay thế
     * @param authentication Đối tượng xác thực chứa thông tin của User đang đăng nhập.
     * @return ResponseEntity với thông báo cập nhật thành công.
     */
    @PutMapping("/detail/{detailId}")
    public ResponseEntity<String> updateChecklistDetail(
            @PathVariable Integer detailId,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) Integer partId,
            Authentication authentication
    ) {
        Users currentUser = (Users) authentication.getPrincipal();
        Integer currentUserId = currentUser.getUserId();

        checklistService.updateChecklistDetail(detailId, status, note, partId, currentUserId);
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

}
