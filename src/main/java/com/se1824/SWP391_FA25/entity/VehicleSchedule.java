package com.se1824.SWP391_FA25.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.se1824.SWP391_FA25.enums.VehicleScheduleStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "Vehicle_Schedule")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_schedule_id")
    Integer vehicleScheduleId;

    @ManyToOne
    @JoinColumn(name = "license_plate", nullable = false)
    @JsonIgnore
    Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnore
    MaintenanceSchedule schedule;

    @Column(name = "maintenance_no", nullable = false)
    Integer maintenanceNo;

    @Column(name = "plan_date", nullable = false)
    LocalDate planDate;

    @Column(name = "deadline", nullable = false)
    LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    VehicleScheduleStatus status;
}