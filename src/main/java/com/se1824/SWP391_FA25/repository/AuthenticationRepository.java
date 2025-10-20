package com.se1824.SWP391_FA25.repository;

//import com.se1824.SWP391_FA25.entity.Users;

import com.se1824.SWP391_FA25.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthenticationRepository extends JpaRepository<Users, Integer> {

    Users findUserByEmail(String email);

    Users findByPhone(String phone);


}
