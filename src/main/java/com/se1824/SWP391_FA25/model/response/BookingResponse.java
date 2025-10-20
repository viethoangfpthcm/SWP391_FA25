package com.se1824.SWP391_FA25.model.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class BookingResponse {
    private Integer bookingId;
    private String vehiclePlate;
    private String vehicleModel;
    private String centerName;
    private String centerAddress;
    private LocalDateTime bookingDate;
    private String status;
    private String note;
}
