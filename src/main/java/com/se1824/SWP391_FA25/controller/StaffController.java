package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.Part;
import com.se1824.SWP391_FA25.model.request.AssignTechnicianRequest;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.MaintenanceChecklistService;
import com.se1824.SWP391_FA25.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;


import java.time.LocalDate;
import java.util.List;

@SecurityRequirement(name = "api")


@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;
    private final AuthenticationService authenticationService;
    private final MaintenanceChecklistService maintenanceChecklistService;

    /**
     * Lấy danh sách booking pending
     * GET /api/staff/bookings/pending?centerId={centerId}
     */
    @GetMapping("/bookings/pending")
    public ResponseEntity<List<StaffBookingDTO>> getPendingBookings() {
        List<StaffBookingDTO> bookings = staffService.getPendingBookings();
        return ResponseEntity.ok(bookings);
    }

    /**
     * Lấy tất cả booking của service center
     * GET /api/staff/bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<StaffBookingDTO>> getAllBookings() {
        List<StaffBookingDTO> bookings = staffService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    /**
     * Approve booking
     * POST /api/staff/bookings/{bookingId}/approve?staffId={staffId}
     */
    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<String> approveBooking(
            @PathVariable Integer bookingId) {
        Integer staffId = authenticationService.getCurrentAccount().getUserId();
        staffService.approveBooking(bookingId, staffId);
        return ResponseEntity.ok("Booking approved successfully");
    }

    /**
     * Decline booking
     * POST /api/staff/bookings/{bookingId}/decline?staffId={staffId}&reason={reason}
     */
    @PostMapping("/bookings/{bookingId}/decline")
    public ResponseEntity<String> declineBooking(
            @PathVariable Integer bookingId,
            @RequestParam String reason) {
        Integer staffId = authenticationService.getCurrentAccount().getUserId();
        staffService.declineBooking(bookingId, staffId, reason);
        return ResponseEntity.ok("Booking declined successfully");
    }

    /**
     * Lấy danh sách technician của service center
     * GET /api/staff/technicians
     */
    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianDTO>> getAvailableTechnicians() {
        List<TechnicianDTO> technicians = staffService.getAvailableTechnicians();
        return ResponseEntity.ok(technicians);
    }

    /**
     * Assign technician
     * POST /api/staff/bookings/assign-technician
     */
    @PostMapping("/bookings/assign-technician")
    public ResponseEntity<String> assignTechnician(
            @RequestBody AssignTechnicianRequest request) {
        Integer staffId = authenticationService.getCurrentAccount().getUserId();
        staffService.assignTechnician(request, staffId);
        return ResponseEntity.ok("Technician assigned successfully");
    }


    /**
     * Lấy chi tiết checklist bảo dưỡng theo Booking ID (cho Staff)
     * GET /api/staff/checklist/{bookingId}
     */
    @GetMapping("/checklist/{bookingId}")
    public ResponseEntity<MaintenanceChecklistResponse> getChecklistDetailsForStaff(
            @PathVariable Integer bookingId) {
        // Gọi service để lấy và kiểm tra quyền
        MaintenanceChecklistResponse checklistResponse = maintenanceChecklistService.getChecklistByBookingIdForStaff(bookingId);
        return ResponseEntity.ok(checklistResponse);
    }

    /**
     * Staff bàn giao xe (Hoàn tất booking sau khi đã Paid và Checklist Completed)
     * POST /api/staff/bookings/{bookingId}/handover
     */
    @PostMapping("/bookings/{bookingId}/handover")
    public ResponseEntity<String> handOverVehicle(@PathVariable Integer bookingId) {
        staffService.handOverVehicle(bookingId);
        return ResponseEntity.ok("Vehicle handed over and booking completed successfully");
    }

    /**
     * Staff xem TẤT CẢ part (phụ tùng) tại center của mình
     * GET /api/staff/parts
     */
    @GetMapping("/parts")
    public ResponseEntity<List<Part>> getAllPartsInCenter() {
        List<Part> parts = staffService.getAllPartsInCenter();
        return ResponseEntity.ok(parts);
    }

    /**
     * Staff xem chi tiết MỘT part (phụ tùng)
     * GET /api/staff/parts/{partId}
     */
    @GetMapping("/parts/{partId}")
    public ResponseEntity<Part> getPartById(@PathVariable Integer partId) {
        Part part = staffService.getPartById(partId);
        return ResponseEntity.ok(part);
    }

    /**
     * Staff xem TẤT CẢ payment tại center của mình
     * GET /api/staff/payments
     */
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDTO>> getAllPaymentsInCenter() {
        List<PaymentDTO> payments = staffService.getAllPaymentsInCenter();
        return ResponseEntity.ok(payments);
    }

    /**
     * Staff xem chi tiết MỘT payment (theo bookingId)
     * GET /api/staff/payments/booking/{bookingId}
     */
    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<PaymentDTO> getPaymentByBookingId(@PathVariable Integer bookingId) {
        PaymentDTO payment = staffService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(payment);
    }
    /**
     * Staff xem chi tiết feedback của 1 booking
     * GET /api/staff/feedback/{bookingId}
     */
    @GetMapping("/feedback/{bookingId}")
    public ResponseEntity<FeedbackDTO> getFeedbackForStaff(@PathVariable Integer bookingId) {
        FeedbackDTO feedbackDTO = staffService.getFeedbackByBookingIdForStaff(bookingId);
        return ResponseEntity.ok(feedbackDTO);
    }
    /**
     * CHART 1 (Staff): Lấy doanh thu của center
     * GET /api/staff/analytics/revenue
     */
    @GetMapping("/analytics/revenue")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenueAnalyticsForStaff(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        RevenueAnalyticsResponse data = staffService.getRevenueAnalyticsForStaff(month, year);
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 2 (Staff): Lấy thống kê booking của center
     * GET /api/staff/analytics/bookings
     */
    @GetMapping("/analytics/bookings")
    public ResponseEntity<BookingAnalyticsResponse> getBookingAnalyticsForStaff(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        BookingAnalyticsResponse data = staffService.getBookingAnalyticsForStaff(month, year);
        return ResponseEntity.ok(data);
    }
    /**
     * CHART 3 (Staff): Lấy thống kê linh kiện của center
     * GET /api/staff/analytics/parts
     */
    @GetMapping("/analytics/parts")
    public ResponseEntity<PartAnalyticsResponse> getPartAnalyticsForStaff(
            @RequestParam(required = false) Integer month, // 'month' là tùy chọn
            @RequestParam int year) { // 'year' là bắt buộc

        PartAnalyticsResponse data = staffService.getPartAnalyticsForStaff(month, year);
        return ResponseEntity.ok(data);
    }

    /**
     * CHART 4 (Staff): Lấy thống kê feedback của center
     * GET /api/staff/analytics/feedbacks
     */
    @GetMapping("/analytics/feedbacks")
    public ResponseEntity<FeedbackStatsDTO> getFeedbackAnalyticsForStaff() {
        FeedbackStatsDTO data = staffService.getFeedbackAnalyticsForStaff();
        return ResponseEntity.ok(data);
    }
}