package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "maintenance_checklist")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class MaintenanceChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnore
    MaintenancePlan plan;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "technician_id", nullable = false)
    @JsonIgnore
    Users technician;

    @Column(name = "actual_km")
    Integer actualKm;

    @Column(name = "start_time")
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Column(name = "status", length = 50)
    String status;

    @Column(name = "note", length = 1000)
    String note;

    @Column(name = "maintenance_no")
    Integer maintenanceNo;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklistDetail> details;
}