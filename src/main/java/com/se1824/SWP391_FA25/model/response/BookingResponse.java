package com.se1824.SWP391_FA25.model.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class BookingResponse {
    Integer bookingId;
    String vehiclePlate;
    String vehicleModel;
    String centerName;
    String centerAddress;
    LocalDateTime bookingDate;
    String status;
    String note;
    LocalDateTime createdAt;
}
