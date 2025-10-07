package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceChecklistRepository {
    Optional<MaintenanceChecklist> findByBooking_BookingId(Integer bookingId);

    List<MaintenanceChecklist> findByTechnician_UserId(String technicianId);

    List<MaintenanceChecklist> findByStatus(String status);

    Optional<MaintenanceChecklist> findByBooking_BookingIdAndStatus(Integer bookingId, String status);

    boolean existsByBooking_BookingId(Integer bookingId);

//    @Query("SELECT mc FROM maintenance_checklist mc WHERE mc.booking_id.user_id= :customerId")
//    List<MaintenanceChecklist> findByCustomerId(@Param("customerId") String customerId);
//
//    @Query("SELECT mc FROM MaintenanceChecklist mc WHERE mc.booking.customer.userId = :customerId AND mc.status = 'Pending_Approval'")
//    List<MaintenanceChecklist> findPendingApprovalByCustomerId(@Param("customerId") String customerId);
//
//    @Query("SELECT mc FROM MaintenanceChecklist mc WHERE mc.booking.serviceCenter.id = :centerId")
//    List<MaintenanceChecklist> findByServiceCenterId(@Param("centerId") Integer centerId);
//
//    @Query("SELECT COUNT(mc) FROM MaintenanceChecklist mc WHERE mc.technician.userId = :technicianId AND mc.status = :status")
//    Long countByTechnicianAndStatus(@Param("technicianId") String technicianId, @Param("status") String status);
}
