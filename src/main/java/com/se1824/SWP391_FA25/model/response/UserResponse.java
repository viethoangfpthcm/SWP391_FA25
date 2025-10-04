package com.se1824.SWP391_FA25.model.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Date;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@Component
public class UserResponse {
    String fullName;
    String email;
    String phone;
    String token;
}
