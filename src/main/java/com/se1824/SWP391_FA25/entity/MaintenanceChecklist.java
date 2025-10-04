package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnore
    MaintenancePlan maintenancePlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    @JsonIgnore
    User technician;

    @Column(name = "status", length = 50, nullable = false)
    String status;  // Pending, In Progress, Completed

    @Column(name = "note", length = 255)
    String note;

    // Relationships
    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklistDetail> checklistDetails;
}