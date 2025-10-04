package com.se1824.SWP391_FA25.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuthenticationRepository extends JpaRepository<User, String> {
    User findByEmail(String email);

    User findByUsername(String username);

    User findById(UUID id);

}
