package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.VehicleSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleScheduleRepository extends JpaRepository<VehicleSchedule, Integer> {
    List<VehicleSchedule> findBySchedule_vehicleModel(String vehicleModel);

    List<VehicleSchedule> findByVehicle_LicensePlate(String licensePlate);
    boolean existsBySchedule_Id(Integer scheduleId);
}
