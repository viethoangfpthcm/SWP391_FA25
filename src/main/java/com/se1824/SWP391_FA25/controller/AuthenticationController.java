package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.request.LoginRequest;
import com.se1824.SWP391_FA25.model.request.RegisterRequest;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
//@SecurityRequirement("api")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest account) {
        //nhận yêu cầu từ FE
        // đẩy qua AuthenticationService
        UserResponse ac = authenticationService.register(account);
        return ResponseEntity.ok(ac);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        UserResponse ac = authenticationService.login(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(ac);
    }

    @GetMapping("/account")
    public ResponseEntity<?> getAllAccount() {
        List<Users> list = authenticationService.getAllAccount();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/account/current")
    public ResponseEntity<?> getCurrentAccount() {

        return ResponseEntity.ok(authenticationService.getCurrentAccount());
    }

//    @GetMapping("/getuser")
//    public ResponseEntity<?> getUserByEmail(String email) {
//        UserResponse user = authenticationService.getUserByEmail(email);
//
//        return ResponseEntity.ok(user);
//    }
//
////    @PostMapping("/register")
////    public ResponseEntity<?> registerUser(@RequestBody Users user) {
////        return ResponseEntity.ok(authenticationService.registerUser(user));
////    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
//        return ResponseEntity.ok(authenticationService.login(loginRequest.getUsername(), loginRequest.getPassword()));
//    }
}
