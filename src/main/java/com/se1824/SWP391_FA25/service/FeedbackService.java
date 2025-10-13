package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Feedback;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {
    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    BookingService bookingService;

    public Feedback save(Feedback feedback, Integer bookingId) {
        Users currentUser = authenticationService.getCurrentAccount();
        feedback.setUser(currentUser);
        feedback.setBooking(bookingService.getBookingById(bookingId));
        return feedbackRepository.save(feedback);
    }
}
