package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService implements UserDetailsService {
    @Autowired
    AuthenticationRepository authenticationRepository;
    @Autowired
    ModelMapper modelMapper;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    TokenService tokenService;

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

    public UserResponse login(String email, String rawPassword) {

        User user = authenticationRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        UserResponse ar = modelMapper.map(user, UserResponse.class);
        String token = tokenService.generateToken(user);
        ar.setToken(token);
        return ar;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return authenticationRepository.findByUsername(username);
    }
}
