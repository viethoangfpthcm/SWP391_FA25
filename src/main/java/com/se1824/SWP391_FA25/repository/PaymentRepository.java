
package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByBooking_BookingId(Integer bookingId);
    List<Payment> findByBooking_ServiceCenter_Id(Integer centerId);
    List<Payment> findByOrderByPaymentDateDesc();

    @Query("SELECT p.booking.serviceCenter.name, SUM(p.laborCost + p.materialCost) " +
            "FROM Payment p " +
            "WHERE p.status = com.se1824.SWP391_FA25.enums.PaymentStatus.PAID " +
            "AND YEAR(p.paymentDate) = :year AND MONTH(p.paymentDate) = :month " +
            "GROUP BY p.booking.serviceCenter.name")
    List<Object[]> findRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT FUNCTION('DAY', p.paymentDate), SUM(p.laborCost + p.materialCost) " +
            "FROM Payment p " +
            "WHERE p.status = com.se1824.SWP391_FA25.enums.PaymentStatus.PAID " +
            "AND p.booking.serviceCenter.id = :centerId " +
            "AND YEAR(p.paymentDate) = :year AND MONTH(p.paymentDate) = :month " +
            "GROUP BY FUNCTION('DAY', p.paymentDate) " +
            "ORDER BY FUNCTION('DAY', p.paymentDate) ASC")
    List<Object[]> findRevenueByCenterAndMonthAndYear(@Param("centerId") int centerId, @Param("month") int month, @Param("year") int year);
}
