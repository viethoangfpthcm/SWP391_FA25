package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ServiceOrders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceOrder {
    @Id
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "binary(16)")
    UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    Vehicle vehicle;

    @Column(name = "order_date", nullable = false)
    LocalDateTime orderDate;


    @Enumerated(EnumType.STRING)
    @Column(length = 50,name = "status")
    ServiceOrderStatus status;
    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (orderDate == null) orderDate = LocalDateTime.now();
    }
    public enum ServiceOrderStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }
}
