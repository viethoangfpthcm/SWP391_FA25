package com.se1824.SWP391_FA25.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;


@Entity
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@Data
public class Users {
    @Id
    @Column(name = "user_id", length = 50)
    String userId;
    @Column(name = "full_name", length = 100, nullable = false)
    String fullName;
    @Column(name = "email", length = 100, nullable = false)
    String email;
    @Column(name = "password", length = 255, nullable = false)
    String password;
    //    @Column(name = "confirm_password", length = 255, nullable = false)
//    String confirmPassword;
    @Column(name = "phone", length = 20)
    String phone;

    public Users(String userId, String fullName, String email, String phone, String password) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    @JsonIgnore
    ServiceCenter serviceCenter;

    // Relationships
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    List<Vehicle> vehicles;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> customerBookings;

    @OneToMany(mappedBy = "assignedTechnician", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> technicianBookings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Feedback> feedbacks;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklist> checklists;
}