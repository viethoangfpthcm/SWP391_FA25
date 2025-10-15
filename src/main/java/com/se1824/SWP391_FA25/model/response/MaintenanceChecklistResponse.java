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


public class MaintenanceChecklistResponse {
    private Integer id;
    private String itemName;
    private String actionType;
    private String status;
    private String approvalStatus;
    private String note;
    private String customerNote;
    private BigDecimal laborCost;
    private BigDecimal materialCost;
    private Integer partId;
    private String partName;
    private List<PartOption> availableParts;
}
