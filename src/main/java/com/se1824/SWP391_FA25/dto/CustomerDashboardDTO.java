package com.se1824.SWP391_FA25.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerDashboardDTO {
    CustomerInfoDTO customerInfo;
    List<VehicleOverviewDTO> vehicles;
     BookingStatsDTO bookingStats;
}
