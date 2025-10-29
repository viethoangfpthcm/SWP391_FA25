package com.se1824.SWP391_FA25.entity;
import com.se1824.SWP391_FA25.enums.ApprovalStatus;
import com.se1824.SWP391_FA25.enums.ChecklistDetailStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_checklist_detail")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class MaintenanceChecklistDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @ManyToOne
    @JoinColumn(name = "checklist_id", nullable = false)
    @JsonIgnore
    MaintenanceChecklist checklist;

    @ManyToOne
    @JoinColumn(name = "plan_item_id", nullable = false)
    @JsonIgnore
    MaintenancePlanItem planItem;

    @ManyToOne
    @JoinColumn(name = "part_id")
    @JsonIgnore
    Part part;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 50)
    ApprovalStatus approvalStatus;

    @Column(name = "customer_note", length = 500)
    String customerNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    ChecklistDetailStatus status;

    @Column(name = "note", length = 1000)
    String note;

    @Column(name = "labor_cost", precision = 18, scale = 2)
    BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "material_cost", precision = 18, scale = 2)
    BigDecimal materialCost = BigDecimal.ZERO;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "completed_at")
    LocalDateTime completedAt;
}