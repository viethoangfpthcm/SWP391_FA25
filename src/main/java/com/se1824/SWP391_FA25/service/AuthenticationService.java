package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    AuthenticationRepository authenticationRepository;

    public Users getUserByEmail(String email) {
        return authenticationRepository.findByEmail(email);
    }

    public Users registerUser(Users user) {
        return authenticationRepository.save(user);
    }
}
