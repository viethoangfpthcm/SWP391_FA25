package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.entity.MaintenanceChecklistDetail;
import com.se1824.SWP391_FA25.enums.ApprovalStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceChecklistDetailRepository extends JpaRepository<MaintenanceChecklistDetail, Integer> {

    @Query("SELECT d FROM MaintenanceChecklistDetail d " +
            "JOIN FETCH d.planItem " +
            "LEFT JOIN FETCH d.part " +
            "WHERE d.checklist.id = :id")
    List<MaintenanceChecklistDetail> findByChecklist_Id(@Param("id") Integer id);


    List<MaintenanceChecklistDetail> findByChecklist_IdAndApprovalStatus(
            Integer checklistId,
            ApprovalStatus approvalStatus);


    @Query("SELECT d.part.name, COUNT(d.id) " +
            "FROM MaintenanceChecklistDetail d " +
            "JOIN d.checklist c " +
            "JOIN c.booking b " +
            "WHERE b.serviceCenter.id = :centerId " +
            "AND YEAR(b.bookingDate) = :year " +
            "AND MONTH(b.bookingDate) = :month " +
            "AND d.part IS NOT NULL " +
            "AND d.approvalStatus = :approvalStatus " +
            "GROUP BY d.part.name")
    List<Object[]> findPartUsageStatsByCenterAndMonthAndYear(
            @Param("centerId") int centerId,
            @Param("month") int month,
            @Param("year") int year,
            @Param("approvalStatus") ApprovalStatus approvalStatus);
}
