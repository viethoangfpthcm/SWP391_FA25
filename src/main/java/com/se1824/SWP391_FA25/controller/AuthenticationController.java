package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @GetMapping("/getuser")
    public ResponseEntity<?> getUserByEmail(String email) {
        Users user = authenticationService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Users user) {
        return null;
    }
}
