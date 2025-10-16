package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.CustomerDashboardDTO;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.response.BookingResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.BookingService;
import com.se1824.SWP391_FA25.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@SecurityRequirement(name = "api")
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerDashboardController {

    private final CustomerDashboardService dashboardService;

    private final BookingService bookingService;
    //private final AuthenticationService authenticationService;
    @Autowired
    private AuthenticationService authenticationService;

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<CustomerDashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    /**
     * Endpoint để lấy danh sách các Booking đã sẵn sàng thanh toán
     */
    @GetMapping("/payments/ready")
    public ResponseEntity<List<BookingResponse>> getReadyForPaymentBookings() {
        Integer userId = authenticationService.getCurrentAccount().getUserId();

        List<BookingResponse> bookings = bookingService.getBookingsReadyForPayment(userId);
        return ResponseEntity.ok(bookings);
    }
}
