package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "ServiceCenter")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class ServiceCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @Column(name = "name", length = 100, nullable = false)
    String name;

    @Column(name = "address", length = 200)
    String address;

    @Column(name = "phone", length = 20)
    String phone;

    // Relationships
    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Users> users;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> bookings;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Part> parts;
}