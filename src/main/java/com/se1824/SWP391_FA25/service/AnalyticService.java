package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.enums.BookingStatus;
import com.se1824.SWP391_FA25.model.response.BookingAnalyticsResponse;
import com.se1824.SWP391_FA25.model.response.RevenueAnalyticsResponse;
import com.se1824.SWP391_FA25.repository.BookingRepository;
import com.se1824.SWP391_FA25.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticService {
    private final PaymentRepository paymentRepo;
    private final BookingRepository bookingRepo;

    /**
     * Lấy dữ liệu doanh thu cho Chart 1
     */
    public RevenueAnalyticsResponse getRevenueAnalytics(Integer month, Integer year, Integer centerId) {
        List<Object[]> results;

        if (centerId == null) {
            // Lấy doanh thu TẤT CẢ center
            log.info("Fetching revenue analytics for all centers, month: {}, year: {}", month, year);
            results = paymentRepo.findRevenueByMonthAndYear(month, year);
        } else {
            // Lấy doanh thu 1 center (chia theo ngày)
            log.info("Fetching revenue analytics for center: {}, month: {}, year: {}", centerId, month, year);
            results = paymentRepo.findRevenueByCenterAndMonthAndYear(centerId, month, year);
        }

        List<String> labels = new ArrayList<>();
        List<BigDecimal> revenue = new ArrayList<>();

        for (Object[] result : results) {
            if (centerId == null) {
                labels.add((String) result[0]); // Tên trung tâm
                revenue.add((BigDecimal) result[1]); // Tổng doanh thu
            } else {
                labels.add("Ngày " + result[0]); // Ngày trong tháng
                revenue.add((BigDecimal) result[1]); // Tổng doanh thu
            }
        }

        if (labels.isEmpty()) {
            log.warn("No revenue data found");
        }

        return new RevenueAnalyticsResponse(labels, revenue);
    }


    /**
     * Lấy dữ liệu thống kê booking cho Chart 2
     */
    public BookingAnalyticsResponse getBookingAnalytics(Integer month, Integer year, Integer centerId) {
        List<Object[]> results;

        if (centerId == null) {
            log.info("Fetching booking analytics for all centers, month: {}, year: {}", month, year);
            results = bookingRepo.findBookingStatsByMonthAndYear(month, year);
        } else {
            log.info("Fetching booking analytics for center: {}, month: {}, year: {}", centerId, month, year);
            results = bookingRepo.findBookingStatsByCenterAndMonthAndYear(centerId, month, year);
        }

        List<String> labels = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (Object[] result : results) {
            labels.add(((BookingStatus) result[0]).name());

            counts.add((Long) result[1]); // Số lượng
        }

        if (labels.isEmpty()) {
            log.warn("No booking stats data found");
        }

        return new BookingAnalyticsResponse(labels, counts);
    }

}
