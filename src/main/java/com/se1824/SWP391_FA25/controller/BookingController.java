package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.request.CreateBookingRequest;
import com.se1824.SWP391_FA25.model.response.BookingResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@SecurityRequirement(name = "api")
@RestController
@RequestMapping("/api/customer/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final AuthenticationService authenticationService;

    /**
     * Lấy thông tin xe để đặt lịch
     * GET /api/customer/bookings/vehicle/{licensePlate}?userId={userId}
     */
    @GetMapping("/vehicle/{licensePlate}")
    public ResponseEntity<VehicleBookingDTO> getVehicleForBooking(
            @PathVariable String licensePlate) {
        Integer userId = authenticationService.getCurrentAccount().getUserId();
        VehicleBookingDTO dto = bookingService.getVehicleForBooking(licensePlate, userId);
        return ResponseEntity.ok(dto);
    }

    /**
     * Tạo booking mới
     * POST /api/customer/bookings
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody CreateBookingRequest request) {
        Users current = authenticationService.getCurrentAccount();
        BookingResponse response = bookingService.createBooking(request, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy danh sách booking của customer
     * GET /api/customer/bookings?userId={userId}
     */
    @GetMapping("/customerBookings/{userId}")
    public ResponseEntity<List<BookingResponse>> getCustomerBookings() {
        Integer userId = authenticationService.getCurrentAccount().getUserId();
        List<BookingResponse> bookings = bookingService.getCustomerBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Hủy booking
     *  /api/customer/bookings/{bookingId}/cancel
     */
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Integer bookingId) {
        Integer userId = authenticationService.getCurrentAccount().getUserId();
        bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}