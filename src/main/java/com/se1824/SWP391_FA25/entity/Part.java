package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "Part")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @Column(name = "name", length = 100, nullable = false)
    String name;

    @Column(name = "quantity", nullable = false)
    Integer quantity = 0;

    @Column(name = "labor_cost", precision = 18, scale = 2)
    BigDecimal laborCost;

    @Column(name = "material_cost", precision = 18, scale = 2)
    BigDecimal materialCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_type_id", nullable = false)
    @JsonIgnore
    PartType partType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_center_id", nullable = false)
    @JsonIgnore
    ServiceCenter serviceCenter;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    MaintenanceSchedule schedule;

    // Relationships
    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklistDetail> checklistDetails;
}