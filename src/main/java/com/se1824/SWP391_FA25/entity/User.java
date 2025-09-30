package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User implements UserDetails {
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return "";
    }

    public enum Role {
        customer, staff, technician, admin
    }
}