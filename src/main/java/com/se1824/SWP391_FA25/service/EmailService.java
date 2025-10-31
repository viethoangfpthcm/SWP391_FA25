package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Payment;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.entity.Vehicle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
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
    /**
     * Gửi email hóa đơn sau khi thanh toán thành công
     * @param payment Đối tượng Payment đã được xác nhận thanh toán
     */
    public void sendInvoiceEmail(Payment payment) {
        try {
            Booking booking = payment.getBooking();
            Users customer = (booking != null) ? booking.getCustomer() : null;
            Vehicle vehicle = (booking != null) ? booking.getVehicle() : null;

            if (payment == null || booking == null || customer == null || vehicle == null) {
                log.error("Can't send invoice email due to missing data.");
                if (payment != null) {
                    log.error("Error in paymemnt: {}", payment.getPaymentId());
                }
                return;
            }

            // Lấy thông tin chi tiết
            String toEmail = customer.getEmail();
            String customerName = customer.getFullName();
            String licensePlate = vehicle.getLicensePlate();
            BigDecimal laborCost = payment.getLaborCost();
            BigDecimal materialCost = payment.getMaterialCost();
            BigDecimal totalAmount = laborCost.add(materialCost);
            String paymentDate = payment.getPaymentDate().format(DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy"));

            // Tạo nội dung Email
            String subject = "Xác nhận thanh toán và hóa đơn cho Booking #" + booking.getBookingId();

            String body = String.format(
                    "Xin chào %s,\n\n" +
                            "EV Service Center xin cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. \n" +
                            "Chúng tôi xác nhận đã nhận được thanh toán thành công cho đơn bảo dưỡng của bạn.\n\n" +
                            "--- THÔNG TIN HÓA ĐƠN ---\n\n" +
                            "Mã Booking: %d\n" +
                            "Biển số xe: %s\n" +
                            "Ngày thanh toán: %s\n" +
                            "Hình thức thanh toán: %s\n\n" +
                            "--- CHI TIẾT CHI PHÍ ---\n" +
                            "Phí nhân công: %,.0f VND\n" +
                            "Phí vật tư: %,.0f VND\n" +
                            "----------------------------------\n" +
                            "TỔNG CỘNG: %,.0f VND\n\n" +
                            "Trân trọng,\n" +
                            "Đội ngũ EV Service Center",

                    customerName,
                    booking.getBookingId(),
                    licensePlate,
                    paymentDate,
                    payment.getPaymentMethod(),
                    laborCost,
                    materialCost,
                    totalAmount
            );

            // Gửi email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Sent invoice information from payment: {}", payment.getPaymentId());

        } catch (Exception e) {
            log.error("Can not send invoice to email: {}. Error: {}",
                    (payment != null ? payment.getPaymentId() : "NULL"), e.getMessage(), e);
        }
    }
}