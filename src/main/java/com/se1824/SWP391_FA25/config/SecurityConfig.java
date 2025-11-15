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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    Filter filter;

    @Autowired
    UserAccessDeniedHandler userAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "https://localhost:*",
                "http://103.90.226.216:3000"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight request for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Sử dụng Bean corsConfigurationSource đã tạo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req -> req
                        // Các API public không cần xác thực
                        .requestMatchers(
                                "/api/users/login",
                                "/api/users/register",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api/payment/**",
                                "/api/users/forgot-password",
                                "/api/users/reset-password"
                        ).permitAll()

                        // Các API yêu cầu quyền STAFF
                        .requestMatchers("/api/staff/**").hasRole("STAFF")

                        // Các API yêu cầu quyền TECHNICIAN
                        .requestMatchers("/api/technician/**").hasRole("TECHNICIAN")

                        // Các API yêu cầu quyền CUSTOMER
                        .requestMatchers(
                                "/api/customer/**",
                                "/api/feedback/**",
                                "/api/customer/bookings/customerBookings/**"
                        ).hasRole("CUSTOMER")

                        // Các API yêu cầu quyền ADMIN
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/staff/technicians",
                                "/api/staff/bookings/assign-technician"
                        ).hasRole("ADMIN")

                        // Tất cả các request còn lại đều phải được xác thực
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e.accessDeniedHandler(userAccessDeniedHandler))
                .userDetailsService(authenticationService)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}