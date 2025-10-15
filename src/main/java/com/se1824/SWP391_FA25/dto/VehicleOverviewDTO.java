package com.se1824.SWP391_FA25.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOverviewDTO {
    @Pattern(
            regexp = "^(41|5[0-9])[A-Z\\d][- ]?\\d{3}[.]?\\d{2}$",
            message = "Biển số xe không hợp lệ hoặc không phải của TP.HCM."
    )
    private String licensePlate;
    private String model;
    private Integer year;
    private Integer currentKm;
    private Integer scheduleId;
    private String scheduleName;


}