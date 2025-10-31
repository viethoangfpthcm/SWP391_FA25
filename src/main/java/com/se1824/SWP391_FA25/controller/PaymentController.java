package com.se1824.SWP391_FA25.controller;


import com.se1824.SWP391_FA25.service.PaymentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "api")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;


    @PostMapping("/create-vnpay-payment/{bookingId}")
    public ResponseEntity<?> createVnPayPayment(@PathVariable Integer bookingId, HttpServletRequest request) {
        try {
            String ipAddress = request.getRemoteAddr();

            String paymentUrl = paymentService.createVnPayPayment(bookingId , ipAddress);

            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @GetMapping("/vnpay-callback")
    public RedirectView vnPayCallback(HttpServletRequest request) {
        try {
            // Lấy các params quan trọng từ VNPay
            String responseCode = request.getParameter("vnp_ResponseCode");
            String transactionNo = request.getParameter("vnp_TransactionNo");
            String amount = request.getParameter("vnp_Amount");
            String txnRef = request.getParameter("vnp_TxnRef");
            String bankCode = request.getParameter("vnp_BankCode");
            String payDate = request.getParameter("vnp_PayDate");

            // Xử lý payment
            int result = paymentService.orderReturn(request);

            String frontendUrl = "http://103.90.226.216:3000/payment/result";

            // Build URL với các params cần thiết
            StringBuilder redirectUrl = new StringBuilder(frontendUrl);
            redirectUrl.append("?vnp_ResponseCode=").append(responseCode != null ? responseCode : "99");

            if (transactionNo != null) {
                redirectUrl.append("&vnp_TransactionNo=").append(transactionNo);
            }
            if (amount != null) {
                redirectUrl.append("&vnp_Amount=").append(amount);
            }
            if (txnRef != null) {
                redirectUrl.append("&vnp_TxnRef=").append(txnRef);
            }
            if (bankCode != null) {
                redirectUrl.append("&vnp_BankCode=").append(bankCode);
            }
            if (payDate != null) {
                redirectUrl.append("&vnp_PayDate=").append(payDate);
            }

            return new RedirectView(redirectUrl.toString());

        } catch (Exception e) {
            String frontendUrl = "http://103.90.226.216:3000/payment/result";
            return new RedirectView(frontendUrl + "?vnp_ResponseCode=99");
        }
    }

}
