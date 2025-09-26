package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.User;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    AuthenticationRepository authenticationRepository;
    @Autowired
    ModelMapper modelMapper;

    public UserResponse getUserByEmail(String email) {

        User us = authenticationRepository.findByEmail(email);
        UserResponse userResponse = modelMapper.map(us, UserResponse.class);
        return userResponse;
    }

    public User registerUser(User user) {
        return authenticationRepository.save(user);
    }
}
