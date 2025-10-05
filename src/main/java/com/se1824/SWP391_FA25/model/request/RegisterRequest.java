package com.se1824.SWP391_FA25.model.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword;
}
