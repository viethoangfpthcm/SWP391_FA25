package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.FeedbackDTO;
import com.se1824.SWP391_FA25.dto.FeedbackStatsDTO;
import com.se1824.SWP391_FA25.dto.PaymentDTO;
import com.se1824.SWP391_FA25.dto.StaffBookingDTO;
import com.se1824.SWP391_FA25.entity.Part;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.ManagerService;
import com.se1824.SWP391_FA25.service.ServiceCenterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "api")
public class ManagerController {
    @Autowired
    ManagerService managerService;
    @Autowired
    ServiceCenterService serviceCenterService;
    @Autowired
    AuthenticationService authentication;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(managerService.getAllUsers());
    }

    @GetMapping("/parts")
    public ResponseEntity<?> getParts() {
        return ResponseEntity.ok(managerService.getAllPart());
    }

    @PostMapping("/parts-create")
    public ResponseEntity<?> createPart(@RequestBody PartCreateRequest partCreateRequest) {
        return ResponseEntity.ok(serviceCenterService.createPart(partCreateRequest, authentication.getCurrentAccount().getCenter().getId()));
    }

    @GetMapping("/parts/{partId}")
    public ResponseEntity<Part> getPartById(@PathVariable Integer partId) {
        Part part = serviceCenterService.getPartById(partId);
        return ResponseEntity.ok(part);
    }

    @PutMapping("/parts/{partId}")
    public ResponseEntity<Part> updatePart(
            @PathVariable Integer partId,
            @Valid @RequestBody PartCreateRequest requestDTO) {
        Part updatedPart = serviceCenterService.updatePartQuantity(partId, requestDTO);

        return new ResponseEntity<>(updatedPart, HttpStatus.OK);
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings() {
        Users user = authentication.getCurrentAccount();
        return ResponseEntity.ok(managerService.getAllBookings(user.getUserId()));
    }

    @GetMapping("/payment")
    public ResponseEntity<?> getPayments() {
        Users user = authentication.getCurrentAccount();
        return ResponseEntity.ok(managerService.getPaymentsByCenter(user.getCenter().getId(), user.getUserId()));
    }
    /**
     * MANAGER: Lấy chi tiết 1 booking
     * GET /api/manager/bookings/{bookingId}
     */
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<StaffBookingDTO> getBookingDetails(
            @PathVariable Integer bookingId) {
        Integer managerId = authentication.getCurrentAccount().getUserId();
        StaffBookingDTO bookingDTO = managerService.getBookingById(bookingId, managerId);
        return ResponseEntity.ok(bookingDTO);
    }

    /**
     * MANAGER: Lấy chi tiết 1 payment (theo bookingId)
     * GET /api/manager/payments/booking/{bookingId}
     */
    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<PaymentDTO> getPaymentByBookingId(
            @PathVariable Integer bookingId) {
        Integer managerId = authentication.getCurrentAccount().getUserId();
        PaymentDTO paymentDTO = managerService.getPaymentByBookingId(bookingId, managerId);
        return ResponseEntity.ok(paymentDTO);
    }

    /**
     * MANAGER: Lấy chi tiết 1 checklist (theo bookingId)
     * GET /api/manager/checklist/{bookingId}
     */
    @GetMapping("/checklist/{bookingId}")
    public ResponseEntity<MaintenanceChecklistResponse> getChecklistDetails(
            @PathVariable Integer bookingId) {
        Integer managerId = authentication.getCurrentAccount().getUserId();
        MaintenanceChecklistResponse checklist = managerService.getChecklistByBookingId(bookingId, managerId);
        return ResponseEntity.ok(checklist);
    }

    /**
     * MANAGER: Lấy chi tiết 1 feedback (theo bookingId)
     * GET /api/manager/feedback/{bookingId}
     */
    @GetMapping("/feedback/{bookingId}")
    public ResponseEntity<FeedbackDTO> getFeedback(
            @PathVariable Integer bookingId) {
        Integer managerId = authentication.getCurrentAccount().getUserId();
        FeedbackDTO feedbackDTO = managerService.getFeedbackByBookingId(bookingId, managerId);
        return ResponseEntity.ok(feedbackDTO);
    }
    /**
     * CHART 1 (Manager): Lấy doanh thu của center
     * GET /api/manager/analytics/revenue
     */
    @GetMapping("/analytics/revenue")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenueAnalyticsForManager(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        RevenueAnalyticsResponse data = managerService.getRevenueAnalyticsForManager(month, year);
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 2 (Manager): Lấy thống kê booking của center
     * GET /api/manager/analytics/bookings
     */
    @GetMapping("/analytics/bookings")
    public ResponseEntity<BookingAnalyticsResponse> getBookingAnalyticsForManager(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        BookingAnalyticsResponse data = managerService.getBookingAnalyticsForManager(month, year);
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 3 (Manager): Lấy thống kê linh kiện của center
     * GET /api/manager/analytics/parts
     */
    @GetMapping("/analytics/parts")
    public ResponseEntity<PartAnalyticsResponse> getPartAnalyticsForManager(
            @RequestParam(required = false) Integer month, // 'month' là tùy chọn
            @RequestParam int year) { // 'year' là bắt buộc

        PartAnalyticsResponse data = managerService.getPartAnalyticsForManager(month, year);
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 4 (Manager): Lấy thống kê feedback của center
     * GET /api/manager/analytics/feedbacks
     */
    @GetMapping("/analytics/feedbacks")
    public ResponseEntity<FeedbackStatsDTO> getFeedbackAnalyticsForManager() {
        FeedbackStatsDTO data = managerService.getFeedbackAnalyticsForManager();
        return ResponseEntity.ok(data);
    }
}
