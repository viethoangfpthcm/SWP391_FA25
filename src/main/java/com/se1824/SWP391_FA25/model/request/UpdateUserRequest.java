package com.se1824.SWP391_FA25.model.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {
    String userId;
    String fullName;
    String email;
    String phone;
    Integer centerId; // Chỉ admin mới được đổi

}
