package com.se1824.SWP391_FA25.repository;

import com.se1824.SWP391_FA25.entity.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Integer> {
    MaintenanceSchedule findByVehicleModel(String vehicleModel);
    //MaintenanceSchedule findByVehicle_LicensePlate(String vehicleLicensePlate);

}
