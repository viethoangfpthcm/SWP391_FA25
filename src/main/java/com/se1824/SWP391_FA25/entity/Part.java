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

    @Column(name = "name", nullable = false, length = 200)
    String name;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "unit_price", precision = 18, scale = 2)
    BigDecimal unitPrice;

    @Column(name = "labor_cost", precision = 18, scale = 2)
    BigDecimal laborCost;

    @Column(name = "material_cost", precision = 18, scale = 2)
    BigDecimal materialCost;

    @ManyToOne
    @JoinColumn(name = "part_type_id", nullable = false)
    PartType partType;

    @ManyToOne
    @JoinColumn(name = "service_center_id", nullable = false)
    @JsonIgnore
    ServiceCenter serviceCenter;


    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklistDetail> checklistDetails;
}