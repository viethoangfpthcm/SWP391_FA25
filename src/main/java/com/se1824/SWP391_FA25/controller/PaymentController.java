package com.se1824.SWP391_FA25.controller;


import com.se1824.SWP391_FA25.entity.Payment;
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
    @Autowired
    private final PaymentService paymentService;


    @PostMapping("/create-vnpay-payment/{bookingId}")
    public ResponseEntity<?> createVnPayPayment(@PathVariable Integer bookingId) {
        try {
            String paymentUrl = paymentService.createVnPayPayment(bookingId);
            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @GetMapping("/vnpay-callback")
    public RedirectView vnPayCallback(HttpServletRequest request) {
        int result = paymentService.orderReturn(request);
        // Chuyển hướng về trang kết quả của frontend
        //  URL địa chỉ frontend
        String frontendUrl = "http://103.90.226.216:3000/payment/result";
        if (result == 0) {
            return new RedirectView(frontendUrl + "?success=true");
        } else {
            return new RedirectView(frontendUrl + "?success=false");
        }
    }

}
