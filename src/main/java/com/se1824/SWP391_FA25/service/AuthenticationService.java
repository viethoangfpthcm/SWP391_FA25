package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
//import com.se1824.SWP391_FA25.model.request.LoginRequest;
import com.se1824.SWP391_FA25.model.request.RegisterRequest;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
//import com.se1824.SWP391_FA25.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AuthenticationService implements UserDetailsService {
    @Autowired
    AuthenticationRepository authenticationRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    TokenService tokenService;

    @Autowired
    EmailService emailService;


    public UserResponse register(RegisterRequest us) {
        if (authenticationRepository.findUserByEmail(us.getEmail()) != null) {
            throw new IllegalStateException("Email đã tồn tại");
        }
        if (authenticationRepository.findByPhone(us.getPhone()) != null) {
            throw new IllegalStateException("Số điện thoại đã tồn tại");
        }
        if (!us.getPassword().equals(us.getConfirmPassword())) {
            throw new IllegalStateException("Mật khẩu không khớp");
        }

        Users users = modelMapper.map(us, Users.class);
        users.setPassword(passwordEncoder.encode(us.getPassword()));
        users.setRole(UserRole.CUSTOMER); // Gán vai trò mặc định
        users.setIsActive(false);

        Users newUser = authenticationRepository.save(users);

        UserResponse ur = modelMapper.map(newUser, UserResponse.class);
        ur.setRole(newUser.getRole().name());

        return ur;
    }


    public List<Users> getAllAccount() {

        return authenticationRepository.findAll();
    }

    public Users getCurrentAccount() {
        return (Users) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return authenticationRepository.findUserByEmail(username);
    }


    // cơ chế:
    // B1: lấy username người dùng nhập
    // B2: tìm trong DB xem có account nào trùng với username đó không
    // B3: authenticationManager => compare tk password dưới DB <=> người dùng nhập
//
    public UserResponse login(String email, String rawPassword) {
        Users user = authenticationRepository.findUserByEmail(email);
        if (user == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BadCredentialsException("Email or password invalid");
        } else if (!user.getIsActive()) {
            throw new IllegalStateException("Tài khoản chưa được kích hoạt.");
        }
        UserResponse ar = modelMapper.map(user, UserResponse.class);
        String token = tokenService.generateToken(user);
        ar.setToken(token);
        ar.setRole(user.getRole().name());
        return ar;
    }
//

    /**
     * Xử lý yêu cầu quên mật khẩu
     *
     * @param email           Email của người dùng
     * @param frontendBaseUrl URL của trang frontend
     */
    public void forgotPassword(String email, String frontendBaseUrl) {
        // 1. Tìm user bằng email
        Users user = authenticationRepository.findUserByEmail(email);
        if (user == null) {
            // Không ném lỗi "không tìm thấy" để bảo mật
            log.warn("Yêu cầu reset mật khẩu cho email không tồn tại: {}", email);
            return; // Không làm gì cả
        }

        // 2. Tạo token ngẫu nhiên
        String token = UUID.randomUUID().toString();
        // 3. Đặt thời gian hết hạn (15 phút từ bây giờ)
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);

        // 4. Lưu token và thời gian hết hạn vào user
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(expiryDate);
        authenticationRepository.save(user);

        // 5. Tạo link reset (trỏ về frontend)
        if (frontendBaseUrl.endsWith("/")) {
            frontendBaseUrl = frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1);
        }
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;

        // 6. Gửi email
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    /**
     * Xử lý việc đặt lại mật khẩu mới
     *
     * @param token           Token từ email
     * @param newPassword     Mật khẩu mới
     * @param confirmPassword Xác nhận mật khẩu mới
     */
    public void resetPassword(String token, String newPassword, String confirmPassword) {
        // 1. Kiểm tra mật khẩu có khớp không
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalStateException("Mật khẩu không khớp");
        }

        // 2. Tìm user bằng token
        Users user = authenticationRepository.findByResetPasswordToken(token);
        if (user == null) {
            throw new IllegalStateException("Token không hợp lệ hoặc đã được sử dụng");
        }

        // 3. Kiểm tra token đã hết hạn chưa
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            authenticationRepository.save(user);

            throw new IllegalStateException("Token đã hết hạn. Vui lòng yêu cầu lại.");
        }

        // 4. Mọi thứ hợp lệ, cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));

        // 5. Vô hiệu hóa token (xoá đi) để không dùng lại được
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        authenticationRepository.save(user);
    }


}
