package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByOwner_UserId(Integer userId);

    Vehicle findByLicensePlate(String licensePlate);
}