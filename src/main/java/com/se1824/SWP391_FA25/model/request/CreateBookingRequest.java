package com.se1824.SWP391_FA25.model.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateBookingRequest {
    
    String vehiclePlate;
    Integer centerId;
    LocalDateTime bookingDate;
    Integer maintenancePlanId;
    String note;
}
