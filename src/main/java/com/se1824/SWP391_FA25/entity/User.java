package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;
@Data
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    UUID id;
    String username;
    String password;
    String fullname;
    String email;
    String phone;
    String role;
    boolean is_active;
    LocalDateTime created_at;

}
