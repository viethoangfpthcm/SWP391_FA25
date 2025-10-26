package com.se1824.SWP391_FA25.model.request;

import com.se1824.SWP391_FA25.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateUserRequest {

    @NotNull(message = "Vai trò không được để trống")
    UserRole role;

    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$",
            message = "Định dạng số điện thoại Việt Nam không hợp lệ"
    )
    String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    String password;
    Integer centerId;
}
