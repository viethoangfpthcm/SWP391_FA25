package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.entity.MaintenanceChecklistDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceChecklistDetailRepository extends JpaRepository<MaintenanceChecklistDetail, Integer> {

    @Query("SELECT d FROM MaintenanceChecklistDetail d JOIN FETCH d.planItem LEFT JOIN FETCH d.part WHERE d.checklist.id = :id")
    List<MaintenanceChecklistDetail> findByChecklist_Id(@Param("id") Integer id);

    List<MaintenanceChecklistDetail> findByChecklistIdAndStatusAndApprovalStatus(
            Integer checklistId,
            String status,
            String approvalStatus
    );
}
