package com.se1824.SWP391_FA25.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    @JsonIgnore
    MaintenanceChecklist checklist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_item_id", nullable = false)
    @JsonIgnore
    MaintenancePlanItem planItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id")
    @JsonIgnore
    Part part;

    @Column(name = "status", length = 50, nullable = false)
        String status;  // tốt – hiệu chỉnh – sửa chữa – thay thế

    @Column(name = "approval_status", length = 50)
    String approvalStatus;  // Pending, Approved, Declined

    @Column(name = "customer_note", length = 255)
    String customerNote;

    @Column(name = "note", length = 255)
    String note;

    @Column(name = "labor_cost", precision = 18, scale = 2)
    BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "material_cost", precision = 18, scale = 2)
    BigDecimal materialCost = BigDecimal.ZERO;
}