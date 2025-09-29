package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vehicle {
    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
     UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, columnDefinition = "uniqueidentifier")
   User customer;

    @Column(name = "frame_number", nullable = false, unique = true)
    String frameNumber;

    @Column(name = "model", nullable = false)
    String model;

    @Column(name = "year")
     Integer year;

    @Column(name = "created_at")
     LocalDateTime createdAt;
}
