package com.se1824.SWP391_FA25.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "Vehicles")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Vehicle {
    @Id
    @Column(name = "licensePlate", length = 20)
    String licensePlate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    User owner;

    @Column(name = "model", length = 100, nullable = false)
    String model;

    @Column(name = "year")
    Integer year;

    @Column(name = "current_km", columnDefinition = "INT DEFAULT 0")
    Integer currentKm = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    MaintenanceSchedule maintenanceSchedule;

    // Relationships
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> bookings;
}

