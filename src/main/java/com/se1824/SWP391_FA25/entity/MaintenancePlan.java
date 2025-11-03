package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "maintenance_plan")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class MaintenancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnore
    MaintenanceSchedule schedule;

    @Column(name = "maintenance_no", nullable = false)
    Integer maintenanceNo;

    @Column(name = "interval_km", nullable = false)
    Integer intervalKm;

    @Column(name = "interval_month", nullable = false)
    Integer intervalMonth;

    @Column(name = "name", length = 200)
    String name;

    @Column(name = "description", length = 500)
    String description;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenancePlanItem> items;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklist> checklists;
}