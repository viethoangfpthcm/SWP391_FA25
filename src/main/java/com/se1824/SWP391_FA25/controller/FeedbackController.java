package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.FeedbackDTO;
import com.se1824.SWP391_FA25.entity.Feedback;
import com.se1824.SWP391_FA25.service.FeedbackService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

@RestController
@RequestMapping("/api/feedback")
@SecurityRequirement(name = "api")
public class FeedbackController {
    @Autowired
    FeedbackService feedbackService;

    /**
     * POST /api/customer/feedback/{bookingId}
     * Tạo hoặc cập nhật feedback cho booking
     * Body: { "rating": 5, "comment": "Dịch vụ tuyệt vời!" }
     */
    @PostMapping("/{bookingId}")
    public ResponseEntity<?> createOrUpdateFeedback(
            @PathVariable Integer bookingId,
            @RequestBody Feedback feedbackRequest
    ) {
        try {
            Feedback feedback = feedbackService.createOrUpdateFeedback(feedbackRequest, bookingId);

            // Chuyển sang DTO để trả về
            FeedbackDTO dto = new FeedbackDTO();
            dto.setFeedbackId(feedback.getFeedbackId());
            dto.setBookingId(feedback.getBooking().getBookingId());
            dto.setUserName(feedback.getUser().getFullName());
            dto.setLicensePlate(feedback.getBooking().getVehicle().getLicensePlate());
            dto.setCenterName(feedback.getBooking().getServiceCenter().getName());
            dto.setRating(feedback.getRating());
            dto.setComment(feedback.getComment());
            dto.setFeedbackDate(feedback.getFeedbackDate());
            dto.setIsPublished(feedback.getIsPublished());

            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/customer/feedback/{bookingId}
     * Lấy feedback của 1 booking
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getFeedbackByBookingId(@PathVariable Integer bookingId) {
        try {
            Feedback feedback = feedbackService.getFeedbackByBookingId(bookingId);

            FeedbackDTO dto = new FeedbackDTO();
            dto.setFeedbackId(feedback.getFeedbackId());
            dto.setBookingId(feedback.getBooking().getBookingId());
            dto.setUserName(feedback.getUser().getFullName());
            dto.setLicensePlate(feedback.getBooking().getVehicle().getLicensePlate());
            dto.setCenterName(feedback.getBooking().getServiceCenter().getName());
            dto.setRating(feedback.getRating());
            dto.setComment(feedback.getComment());
            dto.setFeedbackDate(feedback.getFeedbackDate());
            dto.setIsPublished(feedback.getIsPublished());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * DELETE /api/customer/feedback/{bookingId}
     * Xóa feedback
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Integer bookingId) {
        try {
            feedbackService.deleteFeedback(bookingId);
            return ResponseEntity.ok("Đã xóa feedback thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
