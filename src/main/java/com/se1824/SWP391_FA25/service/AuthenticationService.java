package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.model.request.LoginRequest;
import com.se1824.SWP391_FA25.model.request.RegisterRequest;
import com.se1824.SWP391_FA25.model.response.UserResponse;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import com.se1824.SWP391_FA25.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthenticationService implements UserDetailsService {
    @Autowired
    AuthenticationRepository authenticationRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    TokenService tokenService;

    @Autowired
    UserRepository userRepo;

    public UserResponse register(RegisterRequest us) {
        if (authenticationRepository.findUserByEmail(us.getEmail()) != null) {
            throw new IllegalStateException("Email đã tồn tại");
        }
        if (!us.getPassword().equals(us.getConfirmPassword())) {
            throw new IllegalStateException("Mật khẩu không khớp");
        }

        Users users = modelMapper.map(us, Users.class);
        users.setPassword(passwordEncoder.encode(us.getPassword()));
        users.setRole(UserRole.CUSTOMER); // Gán vai trò mặc định
        users.setIsActive(true);

        Users newUser = authenticationRepository.save(users);

        UserResponse ur = modelMapper.map(newUser, UserResponse.class);
        ur.setRole(newUser.getRole().name());

        return ur;
    }


//    public UserResponse login(LoginRequest loginRequest) {
//        // xử lí logic & xác thực tài khoản
//
//
//        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
//                loginRequest.getEmail(), loginRequest.getPassword()));
//
//        Users account = (Users) authentication.getPrincipal();
//        UserResponse ar = modelMapper.map(account, UserResponse.class);
//        String token = tokenService.generateToken(account);
//        ar.setToken(token);
//        return ar;
//
//
//    }

    public List<Users> getAllAccount() {
        List<Users> list = authenticationRepository.findAll();
        return list;
    }

    public Users getCurrentAccount() {
        return (Users) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return (UserDetails) authenticationRepository.findUserByEmail(username);
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
        }

        UserResponse ar = modelMapper.map(user, UserResponse.class);
        String token = tokenService.generateToken(user);
        ar.setToken(token);
        ar.setRole(user.getRole().name());
        return ar;
    }
//

}
