package com.se1824.SWP391_FA25.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @Pattern(
            regexp = "^(CU|ST|TE)$",
            message = "User ID must start with CU, ST, or TE followed by 3 digits"
    )
    private String userId;
    private String fullName;
    @Email(message = "Invalid email format")
    private String email;
    @Pattern(
            regexp = "^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$",
            message = "Invalid phone number format"
    )
    private String phone;
    private String password;
    private String confirmPassword;
}
