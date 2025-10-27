package com.se1824.SWP391_FA25.model.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotEmpty
    private String token; // Token nhận từ email

    @NotEmpty
    private String newPassword;

    @NotEmpty
    private String confirmPassword;
}
