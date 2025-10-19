package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceChecklistRepository extends JpaRepository<MaintenanceChecklist, Integer> {
    Optional<MaintenanceChecklist> findByBooking_BookingId(Integer bookingId);
    List<MaintenanceChecklist> findByTechnician_UserId(Integer technicianId);
    List<MaintenanceChecklist> findByBooking_Customer_UserId(Integer customerId);

}
