package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.model.request.AssignTechnicianRequest;
import com.se1824.SWP391_FA25.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;



import java.util.List;
@SecurityRequirement(name = "api")


@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;

    /**
     * Lấy danh sách booking pending
     * GET /api/staff/bookings/pending?centerId={centerId}
     */
    @GetMapping("/bookings/pending")
    public ResponseEntity<List<StaffBookingDTO>> getPendingBookings(
            @RequestParam(required = false) Integer centerId) {
        List<StaffBookingDTO> bookings = staffService.getPendingBookings(centerId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Approve booking
     * POST /api/staff/bookings/{bookingId}/approve?staffId={staffId}
     */
    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<String> approveBooking(
            @PathVariable Integer bookingId,
            @RequestParam String staffId) {
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
            @RequestParam String staffId,
            @RequestParam String reason) {
        staffService.declineBooking(bookingId, staffId, reason);
        return ResponseEntity.ok("Booking declined successfully");
    }

    /**
     * Lấy danh sách technician
     * GET /api/staff/technicians?centerId={centerId}
     */
    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianDTO>> getAvailableTechnicians(
            @RequestParam(required = false) Integer centerId) {
        List<TechnicianDTO> technicians = staffService.getAvailableTechnicians(centerId);
        return ResponseEntity.ok(technicians);
    }

    /**
     * Assign technician
     * POST /api/staff/bookings/assign-technician
     */
    @PostMapping("/bookings/assign-technician")
    public ResponseEntity<String> assignTechnician(
            @RequestBody AssignTechnicianRequest request) {
        staffService.assignTechnician(request);
        return ResponseEntity.ok("Technician assigned successfully");
    }
}