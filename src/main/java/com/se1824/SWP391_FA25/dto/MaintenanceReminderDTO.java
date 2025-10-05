package com.se1824.SWP391_FA25.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceReminderDTO {
    private String licensePlate;
    private String model;
    private String message;
    private String severity; // CRITICAL, WARNING
    private Integer currentKm;
    private Integer nextMaintenanceKm;
}