package com.se1824.SWP391_FA25.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleScheduleStatusDTO {
    Integer maintenancePlanId;
    String planName;
    Integer intervalKm;
    Integer intervalMonth;
    LocalDate planDate;
    LocalDate deadline;
    String status;
    String description;
}
