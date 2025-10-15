package com.se1824.SWP391_FA25.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "PartType")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class PartType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Integer id;

    @Column(name = "name", nullable = false, unique = true, length = 200)
    String name;

    @Column(name = "description", length = 500)
    String description;

    @OneToMany(mappedBy = "partType", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Part> parts;

    @OneToMany(mappedBy = "partType", cascade = CascadeType.ALL)
    @JsonIgnore
    List<MaintenancePlanItem> planItems;
}