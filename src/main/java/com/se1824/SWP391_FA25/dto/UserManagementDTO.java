package com.se1824.SWP391_FA25.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserManagementDTO {
    @Pattern(
            regexp = "^(CU|ST|TE)\\d{3}$",
            message = "User ID must start with CU, ST, or TE followed by 3 digits"
    )
    String userId;
    String fullName;
    @Email(message = "Invalid email format")
    String email;
    @Pattern(
            regexp = "^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$",
            message = "Invalid phone number format"
    )
    String phone;
    String role; // STAFF, TECHNICIAN
    Integer centerId;
    String centerName;
}