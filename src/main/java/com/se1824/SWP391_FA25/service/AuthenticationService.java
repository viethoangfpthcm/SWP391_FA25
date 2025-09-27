package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.User;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import io.jsonwebtoken.security.Password;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    AuthenticationRepository authenticationRepository;
    @Autowired
    ModelMapper modelMapper;
    @Autowired
    PasswordEncoder passwordEncoder;


    public UserResponse getUserByEmail(String email) {

//        User us = authenticationRepository.findByEmail(email);
//        UserResponse userResponse = modelMapper.map(us, UserResponse.class);
        User us = authenticationRepository.findByEmail(email);
        
        return modelMapper.map(us, UserResponse.class);
    }

    public User registerUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return authenticationRepository.save(user);
    }
    public UserResponse login (String email, String rawPassword) {
        User user = authenticationRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return modelMapper.map(user, UserResponse.class);
    }
}
