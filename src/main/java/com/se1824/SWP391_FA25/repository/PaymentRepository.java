package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Payment findByBooking_BookingId(Integer bookingId);

    Payment findByPaymentId(Integer paymentId);

    List<Payment> findByStatusAndChecklistId(String status, int checklistId);

}
