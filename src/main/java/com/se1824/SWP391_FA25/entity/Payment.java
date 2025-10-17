package com.se1824.SWP391_FA25.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    Integer paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnore
    Booking booking;

    @Column(name = "payment_date")
    LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "labor_cost", precision = 18, scale = 2)
    BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "material_cost", precision = 18, scale = 2)
    BigDecimal materialCost = BigDecimal.ZERO;

    @Transient
    BigDecimal totalAmount;

    @Column(name = "payment_method", length = 50)
    String paymentMethod;

    @Column(name = "status", length = 50)
    String status;

    @Column(name = "note", length = 500)
    String note;
}