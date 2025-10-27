package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Feedback;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.BookingRepository;
import com.se1824.SWP391_FA25.repository.FeedbackRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {
    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    BookingService bookingService;
    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Tạo hoặc cập nhật feedback cho booking đã hoàn thành
     * - Chỉ cho phép feedback nếu booking có status = "Completed"
     * - Nếu đã có feedback -> cập nhật
     * - Nếu chưa có -> tạo mới
     */
    @Transactional
    public Feedback createOrUpdateFeedback(Feedback feedbackRequest, Integer bookingId) {
        Users currentUser = authenticationService.getCurrentAccount();
        Booking booking = bookingService.getBookingById(bookingId);

        // 1. KIỂM TRA: Booking phải thuộc về user hiện tại
        if (!booking.getVehicle().getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("You have not permits to perform this feature.");
        }

        // 2. KIỂM TRA: Chỉ cho phép feedback khi booking đã hoàn thành
        if (!"Completed".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Must be complete the booking.");
        }

        // 3. VALIDATE: Rating phải từ 1-5
        if (feedbackRequest.getRating() == null ||
                feedbackRequest.getRating() < 1 ||
                feedbackRequest.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be 1 to 5.");
        }

        // 4. KIỂM TRA: Đã có feedback chưa?
        Feedback existingFeedback = feedbackRepository.findByBooking_BookingId(bookingId);

        if (existingFeedback != null) {
            // CẬP NHẬT feedback cũ
            existingFeedback.setRating(feedbackRequest.getRating());
            existingFeedback.setComment(feedbackRequest.getComment());
            existingFeedback.setFeedbackDate(LocalDateTime.now());
            // isPublished giữ nguyên hoặc có thể update nếu cần
            return feedbackRepository.save(existingFeedback);

        } else {
            Feedback newFeedback = new Feedback();
            newFeedback.setUser(currentUser);
            newFeedback.setBooking(booking);
            newFeedback.setRating(feedbackRequest.getRating());
            newFeedback.setComment(feedbackRequest.getComment());
            newFeedback.setFeedbackDate(LocalDateTime.now());
            newFeedback.setCreatedAt(LocalDateTime.now());
            newFeedback.setIsPublished(true);
            return feedbackRepository.save(newFeedback);
        }
    }

    /**
     * Lấy feedback theo booking ID
     */

    public Feedback getFeedbackByBookingId(Integer bookingId) {
        Feedback feedback = feedbackRepository.findByBooking_BookingId(bookingId);
        if (feedback == null) {
            throw new ResourceNotFoundException("This booking are not feedback by customer .");
        }
        return feedback;
    }

    /**
     * Kiểm tra booking đã có feedback chưa
     */
    public boolean hasFeedback(Integer bookingId) {
        return feedbackRepository.findByBooking_BookingId(bookingId) != null;
    }

    /**
     * Xóa feedback (nếu cần)
     */
    @Transactional
    public void deleteFeedback(Integer bookingId) {
        Users currentUser = authenticationService.getCurrentAccount();
        Feedback feedback = feedbackRepository.findByBooking_BookingId(bookingId);

        if (feedback == null) {
            throw new ResourceNotFoundException("Can not found feedback.");
        }

        if (!feedback.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("You have not permits to perform this feature.");
        }

        feedbackRepository.delete(feedback);
    }

    /**
     * Lấy tất cả feedback đã published của 1 center (cho public view)
     */
    public List<Feedback> getPublishedFeedbacksByCenter(Integer centerId) {
        return feedbackRepository.findByBooking_ServiceCenter_IdAndIsPublishedTrue(centerId);
    }
}
