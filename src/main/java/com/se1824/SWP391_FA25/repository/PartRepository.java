package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface PartRepository extends JpaRepository<Part, Integer> {
    /**
     * Lấy danh sách Part của một ServiceCenter, đồng thời tải luôn thông tin PartType.
     * Dùng JOIN FETCH để tránh lỗi N+1 và đảm bảo PartType có trong kết quả.
     */
    @Query("SELECT p FROM Part p JOIN FETCH p.partType pt WHERE p.serviceCenter.id = :centerId ORDER BY p.name ASC")
    List<Part> findByServiceCenterIdWithPartType(@Param("centerId") Integer serviceCenterId);
    List<Part> findByServiceCenter_Id(Integer serviceCenterId);
    List<Part> findByPartType_IdAndServiceCenter_Id(Integer partTypeId, Integer serviceCenterId);
    Optional<Part> findByNameAndServiceCenter_Id(String name, Integer centerId);
}
