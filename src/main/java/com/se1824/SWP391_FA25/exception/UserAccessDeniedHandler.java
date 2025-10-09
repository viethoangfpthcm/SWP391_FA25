package com.se1824.SWP391_FA25.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class UserAccessDeniedHandler implements AccessDeniedHandler {


    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        // Thiết lập thông tin cho response
        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // Status code 403
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8"); // Đảm bảo hỗ trợ tiếng Việt

        // Tạo đối tượng Map để chứa thông báo lỗi
        Map<String, String> message = new HashMap<>();
        message.put("error", "Forbidden");
        message.put("message", "Bạn không có quyền truy cập chức năng này.");

        // Dùng ObjectMapper để chuyển Map thành chuỗi JSON và ghi vào response
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(message));
    }

}
