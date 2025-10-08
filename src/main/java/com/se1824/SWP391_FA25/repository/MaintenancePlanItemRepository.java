package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenancePlanItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenancePlanItemRepository extends JpaRepository<MaintenancePlanItem, Integer> {
    List<MaintenancePlanItem> findByPlan_Id(Integer planId);
}