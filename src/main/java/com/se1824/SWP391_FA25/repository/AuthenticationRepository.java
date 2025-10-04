package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuthenticationRepository extends JpaRepository<User, String> {


}
