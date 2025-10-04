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

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "plan_id", nullable = false)
        @JsonIgnore
        MaintenancePlan plan;

        @Column(name = "item_name", length = 255, nullable = false)
        String itemName;

        @Column(name = "action_type", length = 50, nullable = false)
        String actionType;  // 'check' hoặc 'replace'

        @Column(name = "interval_km")
        Integer intervalKm;

        @Column(name = "interval_month")
        Integer intervalMonth;

        @Column(name = "note", length = 255)
        String note;

        // Relationships
        @OneToMany(mappedBy = "planItem", cascade = CascadeType.ALL)
        @JsonIgnore
        List<MaintenanceChecklistDetail> checklistDetails;
    }