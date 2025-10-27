package com.se1824.SWP391_FA25.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Lấy email "gửi từ" trong file application.properties
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi email reset mật khẩu
     * @param toEmail Email người nhận
     * @param resetLink Link reset (đã bao gồm token)
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail); // Email gửi đi
            message.setTo(toEmail); // Email nhận
            message.setSubject("Yêu cầu đặt lại mật khẩu cho tài khoản EV Service");
            message.setText("Xin chào,\n\n"
                    + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào đường link dưới đây để đặt lại mật khẩu của bạn:\n\n"
                    + resetLink + "\n\n"
                    + "Đường link này sẽ hết hạn sau 15 phút.\n\n"
                    + "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n"
                    + "Trân trọng,\n"
                    + "Đội ngũ EV Service Center");

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}