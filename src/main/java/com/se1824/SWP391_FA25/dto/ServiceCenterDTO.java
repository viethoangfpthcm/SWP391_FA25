package com.se1824.SWP391_FA25.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceCenterDTO {
    Integer id;
    String name;
    String address;
    String phone;
    LocalTime openingHour;
    LocalTime closingHour;
}
