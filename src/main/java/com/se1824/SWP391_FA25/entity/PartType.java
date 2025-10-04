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

    @Column(name = "name", length = 100, nullable = false, unique = true)
    String name;

    // Relationships
    @OneToMany(mappedBy = "partType", cascade = CascadeType.ALL)
    @JsonIgnore
    List<Part> parts;
}