package com.se1824.SWP391_FA25.config;

import com.se1824.SWP391_FA25.exception.UserAccessDeniedHandler;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }


    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    Filter filter;

    @Autowired
    UserAccessDeniedHandler userAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        return http
//                .csrf(AbstractHttpConfigurer::disable)
//                .authorizeHttpRequests(
//                        req -> req
//                                .requestMatchers("/**")
//                                .permitAll()
//                                .anyRequest()
//                                .authenticated()
//
//                )
//                .userDetailsService(authenticationService)
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class).build();
        return http
                .csrf(AbstractHttpConfigurer::disable)
                // <<< PHẦN QUAN TRỌNG NHẤT ĐÃ ĐƯỢC SỬA LẠI
                .authorizeHttpRequests(req -> req
                        // Các API public không cần xác thực
                        .requestMatchers(
                                "/api/users/login",
                                "/api/users/register",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Các API yêu cầu quyền ADMIN
                        .requestMatchers("/api/staff/**").hasRole("STAFF")

                        // Các API yêu cầu quyền USER hoặc ADMIN
                        .requestMatchers("/api/user/**").hasAnyRole("USER")
                        // Các API yêu cầu quyền ADMIN
                        .requestMatchers("/api/admin/**", "/api/staff/technicians", "/api/staff/bookings/assign-technician").hasRole("ADMIN")


                        // Tất cả các request còn lại đều phải được xác thực
                        .anyRequest().authenticated()
                ).exceptionHandling(e -> e.accessDeniedHandler(userAccessDeniedHandler))
                .userDetailsService(authenticationService)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }


}
