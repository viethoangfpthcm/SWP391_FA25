package com.se1824.SWP391_FA25.model.response;
import com.se1824.SWP391_FA25.dto.PartOption;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor

public class MaintenanceChecklistDetailResponse {
    Integer id;
    Integer planItemId;
    String itemName;
    String actionType;

    String status; // Trạng thái kỹ thuật viên cập nhật (Tốt, Sửa chữa, Thay thế)
    String approvalStatus; // Trạng thái khách hàng phê duyệt (Approved, Declined)
    String note; // Ghi chú của kỹ thuật viên
    String customerNote; // Ghi chú của khách hàng

    BigDecimal laborCost;
    BigDecimal materialCost;

    Integer partId;
    String partName;
    List<PartOption> availableParts;
}

