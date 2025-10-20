package com.se1824.SWP391_FA25.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleScheduleStatusDTO {
    private Integer maintenancePlanId;
    private String planName; // Ví dụ: "Bảo dưỡng 20,000 km / 24 tháng"
    private Integer intervalKm;
    private String status; // ON_TIME, EXPIRED, NEXT_TIME
    private String description;
}
