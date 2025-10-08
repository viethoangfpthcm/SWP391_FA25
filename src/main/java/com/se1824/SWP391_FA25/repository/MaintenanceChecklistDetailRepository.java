package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.entity.MaintenanceChecklistDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceChecklistDetailRepository extends JpaRepository<MaintenanceChecklistDetail, Integer> {
    List<MaintenanceChecklistDetail> findByChecklist_Id(Integer checklistId);
    List<MaintenanceChecklistDetail> findByChecklist_IdAndStatus(Integer checklistId, String status);


}
