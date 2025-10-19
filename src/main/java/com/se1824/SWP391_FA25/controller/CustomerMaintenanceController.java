package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistSummaryResponse; // <-- THÊM IMPORT NÀY
import com.se1824.SWP391_FA25.service.MaintenanceChecklistService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/api/customer/maintenance")
@SecurityRequirement(name = "api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerMaintenanceController {
    private final MaintenanceChecklistService checklistService;


    /**
     * Lấy danh sách checklist TÓM TẮT của khách hàng theo customerId.
     *
     * @return danh sách MaintenanceChecklistSummaryResponse.
     */
    @GetMapping("/checklists")
    public ResponseEntity<List<MaintenanceChecklistSummaryResponse>> getCustomerChecklistsSummary() { // Đổi tên cho rõ ràng

        // GỌI PHƯƠNG THỨC SUMMARY MỚI
        List<MaintenanceChecklistSummaryResponse> responses = checklistService.getChecklistByCustomerSummary();
        return ResponseEntity.ok(responses);
    }


    /**
     * Lấy chi tiết đầy đủ (FULL DETAIL) của một Checklist dựa trên Booking ID.
     *
     * @param bookingId ID Booking liên quan đến Checklist
     * @return MaintenanceChecklistResponse (bao gồm Details)
     */
    @GetMapping("/checklists/{bookingId}")
    public ResponseEntity<MaintenanceChecklistResponse> getChecklistDetail(@PathVariable Integer bookingId) {

        // GỌI PHƯƠNG THỨC DETAIL
        MaintenanceChecklistResponse response = checklistService.getChecklistByCustomerAndId(bookingId);
        return ResponseEntity.ok(response);
    }


    /**
     * Cập nhật trạng thái phê duyệt và ghi chú của khách hàng cho một chi tiết checklist
     *
     * @param detailId ID chi tiết checklist
     * @param approvalStatus Trạng thái phê duyệt: APPROVED, DECLINED, PENDING
     * @param customerNote Ghi chú của khách hàng (có thể null)
     * @return thông báo thành công
     */
    @PutMapping("/checklists/details/{detailId}/approval")
    public ResponseEntity<String> updateCustomerApproval(
            @PathVariable Integer detailId,
            @RequestParam String approvalStatus,
            @RequestParam(required = false) String customerNote) {

        checklistService.updateCustomerApproval(detailId, approvalStatus, customerNote);
        return ResponseEntity.ok("Approval status updated successfully");
    }
}