package com.se1824.SWP391_FA25.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.se1824.SWP391_FA25.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.validator.constraints.UniqueElements;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;


@Entity
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@Data
public class Users implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Integer userId;

    @Column(name = "full_name", nullable = false, length = 200)
    String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 200)
    String email;

    @Column(name = "password", nullable = false, length = 255)
    String password;

    @Column(name = "phone", length = 20)
    String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    UserRole role;

    @ManyToOne
    @JoinColumn(name = "center_id")
    @JsonIgnore
    ServiceCenter center;

    @Column(name = "is_active")
    Boolean isActive;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Vehicle> vehicles;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> customerBookings;

    @OneToMany(mappedBy = "assignedTechnician", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Booking> technicianBookings;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenanceChecklist> checklists;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Feedback> feedbacks;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về một danh sách chứa quyền (role) của người dùng
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        // Spring Security sẽ dùng email để định danh người dùng
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Tài khoản không bao giờ hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Tài khoản không bị khóa
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Mật khẩu không bao giờ hết hạn
    }

    @Override
    public boolean isEnabled() {
        return this.isActive; // Lấy trạng thái từ trường isActive
    }

    @Override
    public String toString() {
        return "Users{" +
                "userId='" + userId + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", phone='" + phone + '\''
                ;
    }
}