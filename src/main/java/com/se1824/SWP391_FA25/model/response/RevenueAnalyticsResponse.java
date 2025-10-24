package com.se1824.SWP391_FA25.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueAnalyticsResponse {
    List<String> labels; // Tên trung tâm
    List<BigDecimal> revenue; // Doanh thu tương ứng
}