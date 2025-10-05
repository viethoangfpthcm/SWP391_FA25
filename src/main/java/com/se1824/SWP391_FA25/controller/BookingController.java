package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.model.request.CreateBookingRequest;
import com.se1824.SWP391_FA25.model.response.BookingResponse;
import com.se1824.SWP391_FA25.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    /**
     * Lấy thông tin xe để đặt lịch
     * GET /api/customer/bookings/vehicle/{licensePlate}?userId={userId}
     */
    @GetMapping("/vehicle/{licensePlate}")
    public ResponseEntity<VehicleBookingDTO> getVehicleForBooking(
            @PathVariable String licensePlate,
            @RequestParam String userId) {
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
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy danh sách booking của customer
     * GET /api/customer/bookings?userId={userId}
     */
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getCustomerBookings(
            @RequestParam String userId) {
        List<BookingResponse> bookings = bookingService.getCustomerBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Hủy booking
     * DELETE /api/customer/bookings/{bookingId}?userId={userId}
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Integer bookingId,
            @RequestParam String userId) {
        bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}