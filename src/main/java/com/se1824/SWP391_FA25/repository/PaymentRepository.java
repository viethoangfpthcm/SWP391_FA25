package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByBooking_BookingId(Integer bookingId);
    Payment findByPaymentId(Integer paymentId);



}
