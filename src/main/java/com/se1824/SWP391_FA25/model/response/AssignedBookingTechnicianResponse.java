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
    private String userId;
    private String vehiclePlate;
    private Integer centerId;
    private LocalDateTime bookingDate;
    private String status;
    private String assignedTechnician;
    private String note;
}

