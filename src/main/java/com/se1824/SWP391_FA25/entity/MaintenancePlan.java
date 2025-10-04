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
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class MaintenancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnore
    MaintenanceSchedule schedule;

    @Column(name = "name", length = 255, nullable = false)
    String name;

    // Relationships
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenancePlanItem> planItems;

    @OneToMany(mappedBy = "maintenancePlan", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklist> checklists;
}