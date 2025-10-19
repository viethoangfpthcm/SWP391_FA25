package com.se1824.SWP391_FA25.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor


public class MaintenanceChecklistSummaryResponse {
    Integer id;
    String planName;
    LocalDateTime createdDate;
    String technicianName;
    String status;
    Integer bookingId;
    String vehicleNumberPlate;
    String vehicleModel;
    Integer currentKm;
    Integer maintenanceKm;

    BigDecimal estimatedCost;
    BigDecimal totalCostApproved;
    BigDecimal totalCostDeclined;
}
