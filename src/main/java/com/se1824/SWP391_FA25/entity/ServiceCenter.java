package com.se1824.SWP391_FA25.entity;

import com.se1824.SWP391_FA25.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

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
