package com.se1824.SWP391_FA25.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignedBookingTechnicianResponse {

    private Integer bookingId;
    private String customerName;
    private String vehiclePlate;
    private String vehicleModel;
    private LocalDateTime bookingDate;
    private String status;
    private String note;
    String maintenancePlanName;
}

