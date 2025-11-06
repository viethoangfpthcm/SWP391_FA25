package com.se1824.SWP391_FA25.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow localhost on any port for development and keep the swagger host
        registry.addMapping("/api/**") // Áp dụng cho tất cả các đường dẫn bắt đầu bằng /api/
                .allowedOrigins(
                        "http://103.90.226.216:3000",
                        "http://localhost:3000",
                        "http://localhost:5173"
                ) // Cho phép nguồn gốc này
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                .allowedHeaders("*") // Cho phép tất cả các header
                .allowCredentials(true); // Cho phép gửi cookie và thông tin xác thực
    }
}