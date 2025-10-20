package com.se1824.SWP391_FA25.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "Feedback")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    Integer feedbackId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    Users user;

    @Column(name = "rating", nullable = false)
    Integer rating;

    @Column(name = "comment", length = 1000)
    String comment;

    @Column(name = "feedback_date")
    LocalDateTime feedbackDate = LocalDateTime.now();

    @Column(name = "is_published")
    Boolean isPublished;

    @Column(name = "created_at")
    LocalDateTime createdAt = LocalDateTime.now();
}