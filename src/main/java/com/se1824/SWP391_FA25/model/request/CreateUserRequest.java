package com.se1824.SWP391_FA25.model.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level =  AccessLevel.PRIVATE)
public class CreateUserRequest {
    private String userIdPrefix; // "ST" hoặc "TE"
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private Integer centerId;
}
