package com.se1824.SWP391_FA25.controller;


import com.se1824.SWP391_FA25.entity.Payment;
import com.se1824.SWP391_FA25.service.PaymentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "api")
public class PaymentController {
    @Autowired
    PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Payment payment, @RequestParam Integer bookingId) {
        // Xử lý thanh toán (giả sử thanh toán thành công)
        paymentService.savePayment(payment, bookingId);
        payment.setStatus("COMPLETED");
        return ResponseEntity.ok(payment);
    }
}
