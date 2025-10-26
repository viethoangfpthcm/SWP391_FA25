package com.se1824.SWP391_FA25.dto;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackDTO {
    Integer feedbackId;
    Integer bookingId;
    String userName;
    String licensePlate;
    String centerName;
    Integer rating;
    String comment;
    LocalDateTime feedbackDate;
    Boolean isPublished;
}
