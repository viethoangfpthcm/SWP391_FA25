package com.se1824.SWP391_FA25.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
@Entity
@Table(name = "Services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Service {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "binary(16)")
    UUID id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(length = 255)
    String description;

    @Column(nullable = false)
    Double price;
}
