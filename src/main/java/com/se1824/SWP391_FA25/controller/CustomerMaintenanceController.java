package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
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
     * Lấy danh sách checklist của khách hàng theo customerId
     * @param customerId ID khách hàng (user)
     * @return danh sách checklist
     */
    @GetMapping("/checklists")
    public ResponseEntity<List<MaintenanceChecklistResponse>> getCustomerChecklists(
            @RequestParam String customerId) {

        List<MaintenanceChecklistResponse> responses = checklistService.getChecklistByCustomer(customerId);
        return ResponseEntity.ok(responses);
    }
    /**
     * Cập nhật trạng thái phê duyệt và ghi chú của khách hàng cho một chi tiết checklist
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
