package com.se1824.SWP391_FA25.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NextMaintenanceDTO {
    private Integer planId;
    private String planName; // Bảo dưỡng 12.000 km / 12 tháng
    private Integer intervalKm;
    private Integer intervalMonth;
    private Integer kmUntilMaintenance; // Còn bao nhiêu km nữa
    private String status; // OVERDUE, DUE_SOON, ON_TIME
}