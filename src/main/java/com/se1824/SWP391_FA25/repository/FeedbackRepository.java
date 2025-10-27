package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    Feedback findByBooking_BookingId(Integer bookingId);
    // Lấy tất cả feedback của 1 user
    List<Feedback> findByUser_UserId(Integer userId);
    // Lấy tất cả feedback của 1 center (qua booking)
    List<Feedback> findByBooking_ServiceCenter_Id(Integer centerId);
    // Lấy feedback đã published của 1 center
    List<Feedback> findByBooking_ServiceCenter_IdAndIsPublishedTrue(Integer centerId);

    // Lấy tất cả feedback chưa duyệt (cho admin)
    List<Feedback> findByIsPublishedFalse();
}
