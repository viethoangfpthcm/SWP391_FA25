package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.model.request.LoginRequest;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;


//    @GetMapping("/getuser")
//    public ResponseEntity<?> getUserByEmail(String email) {
//        UserResponse user = authenticationService.getUserByEmail(email);
//
//        return ResponseEntity.ok(user);
//    }
//
////    @PostMapping("/register")
////    public ResponseEntity<?> registerUser(@RequestBody User user) {
////        return ResponseEntity.ok(authenticationService.registerUser(user));
////    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
//        return ResponseEntity.ok(authenticationService.login(loginRequest.getUsername(), loginRequest.getPassword()));
//    }
}
