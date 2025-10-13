    package com.se1824.SWP391_FA25.repository;

    import com.se1824.SWP391_FA25.entity.Booking;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    import java.util.List;

    @Repository
    public interface BookingRepository extends JpaRepository<Booking, Integer> {
        List<Booking> findByCustomer_UserId(String userId);

        List<Booking> findByServiceCenter_IdAndStatus(Integer centerId, String status);

        List<Booking> findByStatus(String status);

        int countByAssignedTechnician_UserIdAndStatusIn(String technicianId, List<String> statuses);

        List<Booking> findByServiceCenter_Id(Integer centerId);
        List<Booking> findByAssignedTechnician_UserId(String technicianId);

    }