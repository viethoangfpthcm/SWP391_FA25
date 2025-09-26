package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.User;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthenticationRepository extends JpaRepository<User, String> {
    User findByEmail(String email);
}
