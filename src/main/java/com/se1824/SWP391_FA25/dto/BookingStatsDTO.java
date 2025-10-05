package com.se1824.SWP391_FA25.dto;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatsDTO {
    private Integer totalBookings;
    private Integer pendingBookings;
    private Integer completedBookings;
    private LocalDateTime lastBookingDate;
}