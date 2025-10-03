package com.se1824.SWP391_FA25.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Invoices")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)

public class Invoice {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "binary(16)")
    UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_order_id", nullable = false)
    ServiceOrder serviceOrder;

    @Column(nullable = false)
    BigDecimal totalAmount;
    LocalDateTime issuedDate;
    LocalDateTime dueDate;
    @Enumerated(EnumType.STRING)
    Status status;
    @CreatedDate
    @Column(updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (issuedDate == null) {
            issuedDate = LocalDateTime.now();
        }
        if (status == null) {
            status = Status.UNPAID;
        }
    }

    public enum Status {
        UNPAID, PAID, CANCELLED
    }
}
