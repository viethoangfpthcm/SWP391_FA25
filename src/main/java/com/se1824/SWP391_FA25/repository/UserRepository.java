package com.se1824.SWP391_FA25.repository;


import com.se1824.SWP391_FA25.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    Users findUserByEmail(String email);
    List<Users> findByUserIdStartingWith(String prefix);
    List<Users> findByServiceCenter_IdAndUserIdStartingWith(Integer centerId, String prefix);
}