package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Booking")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    Integer bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    Users customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_plate", nullable = false)
    @JsonIgnore
    Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id", nullable = false)
    @JsonIgnore
    ServiceCenter serviceCenter;

    @Column(name = "booking_date", nullable = false)
    LocalDateTime bookingDate;

    @Column(name = "status", length = 50, columnDefinition = "NVARCHAR(50) DEFAULT 'Pending'")
    String status = "Pending";  // Pending, Approved, Declined, Completed

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician")
    @JsonIgnore
    Users assignedTechnician;

    @Column(name = "note", length = 255)
    String note;

    // Relationships
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    Payment payment;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Feedback> feedbacks;
}