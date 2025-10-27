package com.se1824.SWP391_FA25.model.response;
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
public class BookingAnalyticsResponse {
     List<String> labels; // Tên trạng thái (Completed, Cancelled...)
    List<Long> counts; // Số lượng booking tương ứng
}