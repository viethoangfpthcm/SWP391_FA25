package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;
@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @Column(columnDefinition = "binary(16)")
    UUID id;

    @Column(nullable = false, unique = true, length = 100)
    String username;

    @Column(name = "password_hash", nullable = false)
     String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    String fullName;

    @Column(unique = true, length = 150)
     String email;

    @Column(length = 50)
    String phone;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
     Role role;

    @Column(name = "is_active", nullable = false)
     boolean active = true;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public enum Role {
        customer, staff, technician, admin
    }
}