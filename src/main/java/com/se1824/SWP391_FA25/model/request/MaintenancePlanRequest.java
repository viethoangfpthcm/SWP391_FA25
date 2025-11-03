package com.se1824.SWP391_FA25.model.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MaintenancePlanRequest {
    private Integer scheduleId;
    private Integer maintenanceNo;
    private Integer intervalKm;
    private Integer intervalMonth;
    private String name;
    private String description;
}
