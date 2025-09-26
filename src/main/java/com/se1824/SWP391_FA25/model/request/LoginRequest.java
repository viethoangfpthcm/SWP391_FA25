package com.se1824.SWP391_FA25.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public class LoginRequest {
    @NotEmpty(message = "username can not empty")
    private String username;
    @NotEmpty
    private String password;
}
