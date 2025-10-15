package com.se1824.SWP391_FA25.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
    @Column(name = "license_plate", length = 20)
    String licensePlate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    Users owner;

    @Column(name = "model", nullable = false, length = 200)
    String model;

    @Column(name = "year")
    Integer year;

    @Column(name = "purchase_date", nullable = false)
    LocalDate purchaseDate;

    @Column(name = "current_km")
    Integer currentKm;

    @Column(name = "current_maintenance_no")
    Integer currentMaintenanceNo;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> bookings;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Part> parts;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @JsonIgnore
    List<VehicleSchedule> schedules;
}

