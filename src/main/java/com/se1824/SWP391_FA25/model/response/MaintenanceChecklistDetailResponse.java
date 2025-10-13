package com.se1824.SWP391_FA25.model.response;
import com.se1824.SWP391_FA25.dto.PartOption;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor

public class MaintenanceChecklistDetailResponse {
    Integer id;
    Integer planItemId;
    Integer partId;
    String itemName;
    String partName;
    String actionType;
    String status;
    String approvalStatus;
    String note;
    String customerNote;
    BigDecimal laborCost;
    BigDecimal materialCost;
    List<PartOption> availableParts;
}

