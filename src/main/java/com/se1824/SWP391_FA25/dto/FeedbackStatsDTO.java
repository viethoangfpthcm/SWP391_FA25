package com.se1824.SWP391_FA25.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackStatsDTO {
    double averageRating;
    long totalRatings;
    List<FeedbackDTO> feedbacks;
}
