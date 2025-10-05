package com.se1824.SWP391_FA25.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOverviewDTO {
    private String licensePlate;
    private String model;
    private Integer year;
    private Integer currentKm;
    private Integer scheduleId;
    private String scheduleName; // VF3, VF5, VF7, VF9
    private NextMaintenanceDTO nextMaintenance;

}