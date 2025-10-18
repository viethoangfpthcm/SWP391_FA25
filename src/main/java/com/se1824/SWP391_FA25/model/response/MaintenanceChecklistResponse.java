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


public class MaintenanceChecklistResponse {
    Integer id;
    String planName;
    LocalDateTime createdDate;
    String technicianName;
    String status;

    String vehicleNumberPlate;
    String vehicleModel;
    Integer currentKm;
    Integer maintenanceKm;

    BigDecimal estimatedCost;
    BigDecimal totalCostApproved;
    BigDecimal totalCostDeclined;
    List<MaintenanceChecklistDetailResponse> details;
}
