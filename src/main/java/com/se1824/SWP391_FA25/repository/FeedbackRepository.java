package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    Feedback findByBooking_BookingId(Integer bookingId);
    // Lấy feedback đã published của 1 center
    List<Feedback> findByBooking_ServiceCenter_IdAndIsPublishedTrue(Integer centerId);
    boolean existsByBooking_BookingId(Integer bookingId);
    List<Feedback> findByIsPublishedTrue();
}
