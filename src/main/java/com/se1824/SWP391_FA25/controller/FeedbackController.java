package com.se1824.SWP391_FA25.controller;

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

    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(
            @RequestBody Feedback feedback,
            @RequestParam Integer bookingId
    ) {
        Feedback savedFeedback = feedbackService.save(feedback, bookingId);
        return ResponseEntity.ok(savedFeedback);
    }
}
