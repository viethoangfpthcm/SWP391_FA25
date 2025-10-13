package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    Feedback findByBooking_BookingId(Integer bookingId);

    //Feedback findByBooking_Users_userId(Integer userId);
}
