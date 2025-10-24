package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface PartRepository extends JpaRepository<Part, Integer> {
    List<Part> findByServiceCenter_Id(Integer serviceCenterId);
    List<Part> findByPartType_IdAndServiceCenter_Id(Integer partTypeId, Integer serviceCenterId);
}
