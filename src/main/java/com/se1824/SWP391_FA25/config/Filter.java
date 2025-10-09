package com.se1824.SWP391_FA25.config;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.service.TokenService;
import com.se1824.SWP391_FA25.exception.exceptions.AuthenticationException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.List;

@Component
public class Filter extends OncePerRequestFilter {
    @Autowired
    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Autowired
    TokenService tokenService;

    private final List<String> PUBLIC_API = List.of(
            "GET:/swagger-ui/**",
            "GET:/v3/api-docs/**",
            "GET:/swagger-resources/**",
            "POST:/api/users/register",
            "POST:/api/users/login"
    );

//    public boolean isPublicAPI(String uri, String method) {
//        AntPathMatcher matcher = new AntPathMatcher();
//
    /// /        if (method.equals("GET")) return true;
//
//        return PUBLIC_API.stream().anyMatch(pattern -> {
//            String[] parts = pattern.split(":", 2);
//            if (parts.length != 2) return false;
//
//            String allowedMethod = parts[0];
//            String allowedUri = parts[1];
//
//            return matcher.match(allowedUri, uri);
//        });
//    }
//
//    public String getToken(HttpServletRequest request) {
//        String authHeader = request.getHeader("Authorization");
//        if (authHeader == null) return null;
//        return authHeader.substring(7);
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        System.out.println("filter is running. . . . .  .");
//        String uri = request.getRequestURI();
//        String method = request.getMethod();
//        if (isPublicAPI(uri, method)) {
//            //API public
//            // => access
//            filterChain.doFilter(request, response);
//        } else {
//            //API theo role
//            // => check xem có quyền không
//            // => check token
//            String token = getToken(request);
//
//            if (token != null) {
//                // => có token
//                // => verify lại cái token
//                //Users account = null;
//                try {
//                    Users account = tokenService.extractToken(token);
//                    UsernamePasswordAuthenticationToken
//                            authenToken =
//                            new UsernamePasswordAuthenticationToken(account, token, account.getAuthorities());
//                    authenToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                    SecurityContextHolder.getContext().setAuthentication(authenToken);
//                } catch (ExpiredJwtException e) {
//                    // 1. Token hết hạn
//                    resolver.resolveException(request, response, new AuthenticationException("Expired token"), e);
//                    return;
//                } catch (MalformedJwtException e) {
//                    // 2. Token sai
//                    resolver.resolveException(request, response, new AuthenticationException("Invalid token"), e);
//                    return;
//                } catch (Exception e) {
//                    // Bắt các lỗi khác có thể xảy ra
//                    resolver.resolveException(request, response, new AuthenticationException("Authentication error"), e);
//                    return; // QUAN TRỌNG: Dừng thực thi tại đây
//                }
//                ;
//                // lưu thông tin thằng đang request
//
//
//                // => token chuẩn
//                // => được phép truy cập vào hệ thống
//                filterChain.doFilter(request, response);
//
//            } else {
//                resolver.resolveException(request, response, null, new AuthenticationException("má thằng chó đéo có token"));
//            }
//        }
//
//
//    }

// Sử dụng AntPathMatcher để so khớp đường dẫn kiểu wildcard (VD: /swagger-ui/**)
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private boolean isPublicAPI(HttpServletRequest request) {
        String requestMethod = request.getMethod();
        String requestURI = request.getRequestURI();

        return PUBLIC_API.stream().anyMatch(pattern -> {
            String[] parts = pattern.split(":", 2);
            String method = parts[0];
            String path = parts[1];
            // <<< SỬA LỖI: Kiểm tra cả method và URI
            return requestMethod.equalsIgnoreCase(method) && pathMatcher.match(path, requestURI);
        });
    }

    private String getToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (isPublicAPI(request)) {
            filterChain.doFilter(request, response); // Cho qua nếu là API public
            return;
        }

        String token = getToken(request);
        if (token == null) {
            // <<< THAY ĐỔI: Thông báo lỗi chuyên nghiệp
            resolver.resolveException(request, response, null, new AuthenticationException("Authorization token is missing."));
            return;
        }

        try {
            Users account = tokenService.extractToken(token);

            // Quan trọng: Kiểm tra xem user có tồn tại và token chưa được xác thực trong context
            if (account != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Tạo đối tượng xác thực
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        account, // Principal: đối tượng người dùng
                        null,    // Credentials: null vì đã xác thực bằng token
                        account.getAuthorities() // Authorities: các quyền của người dùng
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Lưu vào SecurityContext để Spring Security có thể sử dụng
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response); // Cho phép request đi tiếp

        } catch (ExpiredJwtException e) {
            resolver.resolveException(request, response, null, new AuthenticationException("Token has expired."));
        } catch (MalformedJwtException e) {
            resolver.resolveException(request, response, null, new AuthenticationException("Invalid token format."));
        } catch (Exception e) {
            resolver.resolveException(request, response, null, new AuthenticationException("Authentication failed."));
        }
    }
}

