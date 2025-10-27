package com.se1824.SWP391_FA25.model.request;

import com.se1824.SWP391_FA25.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {
    //    @Pattern(
//            regexp = "^(CU|ST|TE)\\d{3}$",
//            message = "User ID must start with CU, ST, or TE followed by 3 digits"
//    )
//    String userId;
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "")
    String fullName;

    @Email(message = "Invalid email format")
    String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    String password;

    @Pattern(
            regexp = "^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$",
            message = "Invalid phone number format"
    )
    String phone;
    Integer centerId; // Chỉ admin mới được đổi

    UserRole role;

}
