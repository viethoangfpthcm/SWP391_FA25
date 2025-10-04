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
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    Booking booking;

    @Column(name = "payment_date", nullable = false, columnDefinition = "DATETIME DEFAULT GETDATE()")
    LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "labor_cost", precision = 18, scale = 2, nullable = false)
    BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "material_cost", precision = 18, scale = 2, nullable = false)
    BigDecimal materialCost = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 18, scale = 2, insertable = false, updatable = false)
    BigDecimal totalAmount;

    @Column(name = "status", length = 50, nullable = false, columnDefinition = "NVARCHAR(50) DEFAULT 'Pending'")
    String status = "Pending";  // Pending, Paid, Cancelled

    @Column(name = "note", length = 255)
    String note;
}