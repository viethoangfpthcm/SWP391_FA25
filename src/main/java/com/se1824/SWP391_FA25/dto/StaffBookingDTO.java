package com.se1824.SWP391_FA25.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffBookingDTO {
    Integer bookingId;
    String customerName;
    String customerPhone;
    String vehiclePlate;
    String vehicleModel;
    Integer currentKm;
    LocalDateTime bookingDate;
    String status;
    String note;
    String centerName;
    String technicianName;
    String ChecklistStatus;
    Boolean hasFeedback;
}