package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.User;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    AuthenticationRepository authenticationRepository;

    public User getUserByEmail(String email) {
        return authenticationRepository.findByEmail(email);
    }

    public User registerUser(User user) {
        return authenticationRepository.save(user);
    }
}
