package com.se1824.SWP391_FA25.repository;


import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<Users, Integer> {
    Users findUserByEmail(String email);
    List<Users> findByCenter_IdAndRole(Integer centerId, UserRole role);
    List<Users> findByRole(UserRole role);

}