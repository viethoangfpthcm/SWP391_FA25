package com.se1824.SWP391_FA25.model.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ServiceCenterRequest {
    @NotBlank(message = "Can not blank name.")
    @Size(max = 255, message = "Tên trung tâm không quá 255 ký tự.")
    @Pattern(
            regexp = "^[\\p{L}0-9\\s]+$",
            message = "Name just had alphanumeric."
    )
    private String name;
    @NotBlank(message = "Can not blank phone.")
    @Pattern(
            regexp = "^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$",
            message = "Phone are not valid pattern."
    )
    private String phone;

    @NotBlank(message = "Can not blank address.")
    @Size(max = 500, message = "Must be in 500 character.")
    private String address;
}
