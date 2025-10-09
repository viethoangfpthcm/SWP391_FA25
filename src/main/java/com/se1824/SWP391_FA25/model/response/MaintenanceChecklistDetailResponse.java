package com.se1824.SWP391_FA25.model.response;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor

public class MaintenanceChecklistDetailResponse {
    Integer id;
    String itemName;
    String status;
    String approvalStatus;
    String note;
    String partName;
    Integer partQuantityUsed;
    String customerNote;
    BigDecimal laborCost;
    BigDecimal materialCost;
}
