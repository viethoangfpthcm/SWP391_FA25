package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenancePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenancePlanRepository extends JpaRepository<MaintenancePlan, Integer> {
    List<MaintenancePlan> findBySchedule_Id(Integer scheduleId);
    void deleteBySchedule_Id(Integer scheduleId);
    boolean existsBySchedule_IdAndMaintenanceNo(Integer scheduleId, Integer maintenanceNo);
}