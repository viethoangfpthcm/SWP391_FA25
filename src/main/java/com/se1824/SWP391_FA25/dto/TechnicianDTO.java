package com.se1824.SWP391_FA25.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicianDTO {
    Integer userId;
    String fullName;
    String phone;
    Integer activeBookings;

}
