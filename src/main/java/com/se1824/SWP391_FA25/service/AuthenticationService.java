package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Users;
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
        //xử lí login của controller đưa qua

        if (authenticationRepository.findUserByEmail(us.getEmail()) != null) {
            throw new IllegalStateException("Email đã tồn tại");
        } else {
            if (!us.getPassword().equals(us.getConfirmPassword())) {
                throw new IllegalStateException("Mật khẩu không khớp");
            }
        }
        String prefix = us.getUserId().substring(0, 2);
        String newUserId = generateUserId(prefix);
        Users users = modelMapper.map(us, Users.class);
        users.setUserId(newUserId);
        users.setPassword(passwordEncoder.encode(us.getPassword()));
        //users.setUserId(us.getUserId());
        Users newUser = authenticationRepository.save(users);
        UserResponse ur = new UserResponse();
        ur.setEmail(newUser.getEmail());
        ur.setFullName(newUser.getFullName());
        ur.setPhone(newUser.getPhone());

        return ur;
        //lưu vào DB


    }

    private String generateUserId(String prefix) {
        // Tìm userId cuối cùng với prefix này
        List<Users> users = userRepo.findByUserIdStartingWith(prefix);

        if (users.isEmpty()) {
            return prefix + "001";
        }

        // Lấy số lớn nhất
        int maxNumber = users.stream()
                .map(u -> {
                    try {
                        return Integer.parseInt(u.getUserId().substring(2));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .max(Integer::compareTo)
                .orElse(0);

        int nextNumber = maxNumber + 1;
        return prefix + String.format("%03d", nextNumber);
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
        String role = user.getAuthorities().stream()
                .findFirst() // Lấy quyền đầu tiên
                .map(GrantedAuthority::getAuthority) // Lấy tên quyền (VD: "ROLE_ADMIN")
                .map(r -> r.replace("ROLE_", "")) // Bỏ tiền tố "ROLE_"
                .orElse("UNKNOWN");
        ar.setRole(role);
        return ar;
    }
//

}
