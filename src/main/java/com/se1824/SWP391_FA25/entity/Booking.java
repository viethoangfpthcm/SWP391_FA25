package com.se1824.SWP391_FA25.entity;

import com.se1824.SWP391_FA25.enums.BookingStatus;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    Users customer;

    @ManyToOne
    @JoinColumn(name = "vehicle_plate", nullable = false)
    @JsonIgnore
    Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    @JsonIgnore
    ServiceCenter serviceCenter;

    @Column(name = "booking_date", nullable = false)
    LocalDateTime bookingDate;

    @Column(name = "maintenance_no")
    Integer maintenanceNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    BookingStatus status;

    @ManyToOne
    @JoinColumn(name = "assigned_technician")
    @JsonIgnore
    Users assignedTechnician;

    @Column(name = "note", length = 500)
    String note;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    Payment payment;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    java.util.List<Feedback> feedbacks;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    MaintenanceChecklist checklist;
    @ManyToOne
    @JoinColumn(name = "plan_id")
    @JsonIgnore
    MaintenancePlan maintenancePlan;
}