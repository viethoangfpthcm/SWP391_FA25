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
    private Integer id;
    private String planName;
    private LocalDateTime createdDate;
    private String technicianName;
    private String status;
    private String vehicleNumberPlate;
    private String vehicleModel;
    private Integer currentKm;
    private Integer maintenanceKm;
    private BigDecimal estimatedCost;
    private BigDecimal totalCostApproved;
    private BigDecimal totalCostDeclined;
    private List<MaintenanceChecklistDetailResponse> details;
}

