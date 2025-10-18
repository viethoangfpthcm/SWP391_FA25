    package com.se1824.SWP391_FA25.entity;
    import jakarta.persistence.*;
    import lombok.*;
    import lombok.experimental.FieldDefaults;
    import com.fasterxml.jackson.annotation.JsonIgnore;

    import java.util.List;

    @Entity
    @Table(name = "maintenance_plan_item")
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @Getter
    @Setter
    public class MaintenancePlanItem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id")
        Integer id;

        @ManyToOne
        @JoinColumn(name = "plan_id", nullable = false)
        @JsonIgnore
        MaintenancePlan plan;

        @Column(name = "item_name", nullable = false, length = 200)
        String itemName;

        @Column(name = "action_type", nullable = false, length = 50)
        String actionType;

        @ManyToOne
        @JoinColumn(name = "part_type_id", nullable = false)
        @JsonIgnore
        PartType partType;

        @Column(name = "note", length = 500)
        String note;

        @OneToMany(mappedBy = "planItem", cascade = CascadeType.ALL)
        @JsonIgnore
        List<MaintenanceChecklistDetail> checklistDetails;
    }