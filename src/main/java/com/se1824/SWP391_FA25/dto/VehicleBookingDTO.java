package com.se1824.SWP391_FA25.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleBookingDTO {
    @Pattern(
            regexp = "^(41|5[0-9])[A-Z\\d][- ]?\\d{3}[.]?\\d{2}$",
            message = "Biển số xe không hợp lệ hoặc không phải của TP.HCM."
    )
    String licensePlate;
    String model;
    Integer year;
    Integer currentKm;
    List<ServiceCenterDTO> availableCenters;
}
