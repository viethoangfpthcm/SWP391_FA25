package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.request.LoginRequest;
import com.se1824.SWP391_FA25.model.request.RegisterRequest;
import com.se1824.SWP391_FA25.model.request.ResetPasswordRequest;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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

    /**
     * Endpoint cho yêu cầu quên mật khẩu
     * Nhận email từ request body
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email là bắt buộc");
            }
            String frontendBaseUrl = "http://103.90.226.216:3000";

            authenticationService.forgotPassword(email, frontendBaseUrl);

            return ResponseEntity.ok("Nếu email tồn tại, email đặt lại mật khẩu đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    /**
     * Endpoint để xử lý việc đặt lại mật khẩu mới
     * Nhận token, newPassword, confirmPassword từ request body
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authenticationService.resetPassword(
                    request.getToken(),
                    request.getNewPassword(),
                    request.getConfirmPassword()
            );
            return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
