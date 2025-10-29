package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.se1824.SWP391_FA25.enums.BookingStatus;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCustomer_UserId(Integer userId);


    List<Booking> findByServiceCenter_IdAndStatus(Integer centerId, BookingStatus status);

    List<Booking> findByVehicle_LicensePlate(String licensePlate);

    int countByAssignedTechnician_UserIdAndStatusIn(Integer technicianId, Collection<BookingStatus> statuses);

    List<Booking> findByServiceCenter_Id(Integer centerId);

    List<Booking> findByAssignedTechnician_UserId(Integer technicianId);


    List<Booking> findByVehicle_LicensePlateAndStatus(String licensePlate, BookingStatus status);

    /**
     * Lấy tất cả booking theo Service Center ID
     * Sắp xếp theo ngày booking mới nhất
     */
    List<Booking> findByServiceCenter_IdOrderByBookingDateDesc(Integer centerId);

    List<Booking> findByOrderByBookingDateDesc();

    @Query("SELECT b.status, COUNT(b.bookingId) " +
            "FROM Booking b " +
            "WHERE YEAR(b.bookingDate) = :year AND MONTH(b.bookingDate) = :month " +
            "GROUP BY b.status")
    List<Object[]> findBookingStatsByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT b.status, COUNT(b.bookingId) " +
            "FROM Booking b " +
            "WHERE b.serviceCenter.id = :centerId " +
            "AND YEAR(b.bookingDate) = :year AND MONTH(b.bookingDate) = :month " +
            "GROUP BY b.status")
    List<Object[]> findBookingStatsByCenterAndMonthAndYear(@Param("centerId") int centerId, @Param("month") int month, @Param("year") int year);
}