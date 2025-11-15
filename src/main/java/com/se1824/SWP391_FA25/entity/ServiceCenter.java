package com.se1824.SWP391_FA25.entity;


import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalTime;
import java.util.List;



@Entity
@Table(name = "ServiceCenter")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @Column(name = "name", nullable = false, length = 200)
    String name;

    @Column(name = "address", length = 500)
    String address;

    @Column(name = "phone", length = 20)
    String phone;

    @Column(name = "opening_hour")
    private LocalTime openingHour;

    @Column(name = "closing_hour")
    private LocalTime closingHour;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Part> parts;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL) //
    @JsonIgnore
    List<Booking> bookings;

    @OneToMany(mappedBy = "center", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Users> users;
}
