package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDashboardService {

    private final VehicleRepository vehicleRepo;
    private final BookingRepository bookingRepo;
    private final MaintenancePlanRepository planRepo;
    private final UserRepository userRepo;
    private final MaintenanceScheduleRepository maintenanceScheduleRepo;
    private final AuthenticationService authenticationService;
    private final VehicleScheduleRepository vehicleScheduleRepo;

    /**
     * Lấy tất cả thông tin cần thiết cho dashboard của khách hàng.
     */
    public CustomerDashboardDTO getDashboard() {
        // Lấy thông tin người dùng đang đăng nhập
        Users currentUser = authenticationService.getCurrentAccount();

        CustomerDashboardDTO dashboard = new CustomerDashboardDTO();

        // 1. Lấy thông tin cá nhân của khách hàng
        dashboard.setCustomerInfo(mapToCustomerInfo(currentUser));

        // 2. Lấy danh sách xe của khách hàng
        List<Vehicle> vehicles = vehicleRepo.findByOwner_UserId(currentUser.getUserId());
        dashboard.setVehicles(vehicles.stream()
                .map(this::mapToVehicleOverview)
                .collect(Collectors.toList()));

        // 3. Lấy thống kê về các lịch hẹn
        dashboard.setBookingStats(getBookingStats(currentUser.getUserId()));

        // Lưu ý: Phần "Maintenance Reminders" đã được loại bỏ vì logic cũ không còn phù hợp.
        // Dữ liệu chi tiết về lịch trình bảo dưỡng sẽ được lấy qua một API riêng.

        return dashboard;
    }


    /**
     * Lấy lịch trình bảo dưỡng của xe với trạng thái dựa trên thời gian.
     */
    public List<VehicleScheduleStatusDTO> getVehicleMaintenanceSchedule(String licensePlate) {
        Vehicle vehicle = vehicleRepo.findById(licensePlate)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + licensePlate));

        if (vehicle.getSchedules() == null || vehicle.getSchedules().isEmpty()) {
            throw new ResourceNotFoundException("No maintenance schedule assigned to this vehicle.");
        }

        MaintenanceSchedule schedule = vehicle.getSchedules().stream()
                .findFirst()
                .map(VehicleSchedule::getSchedule)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle is not linked to a valid Maintenance Schedule."));

        List<MaintenancePlan> plans = planRepo.findBySchedule_Id(schedule.getId());
        LocalDate purchaseDate = vehicle.getPurchaseDate();
        LocalDate currentDate = LocalDate.now();

        List<Integer> completedMaintenanceNos = bookingRepo.findByVehicle_LicensePlateAndStatus(licensePlate, "Completed")
                .stream()
                .filter(booking -> booking.getMaintenancePlan() != null)
                .map(booking -> booking.getMaintenancePlan().getMaintenanceNo())
                .collect(Collectors.toList());

        return plans.stream().map(plan -> {
            VehicleScheduleStatusDTO dto = new VehicleScheduleStatusDTO();
            dto.setMaintenancePlanId(plan.getId());
            dto.setPlanName(plan.getName());
            dto.setDescription(plan.getDescription());
            dto.setIntervalKm(plan.getIntervalKm());


            // Tính ngày hết hạn dự kiến cho mốc bảo dưỡng này
            LocalDate dueDate = purchaseDate.plusMonths(plan.getIntervalMonth());

            if (completedMaintenanceNos.contains(plan.getMaintenanceNo())) {
                dto.setStatus("ON_TIME"); // Đã hoàn thành trong một booking trước đó
            } else if (currentDate.isAfter(dueDate)) {
                dto.setStatus("EXPIRED"); // Đã quá hạn theo thời gian
            } else {
                dto.setStatus("NEXT_TIME"); // Các mốc trong tương lai, có thể đặt lịch
            }


            return dto;
        }).collect(Collectors.toList());
    }

    /*
     * Customer theo xe mới
     */
    public Vehicle createVehicle(Vehicle vehicle) {
        Users currentUser = authenticationService.getCurrentAccount();
        vehicle.setOwner(currentUser);
        vehicle.setBookings(bookingRepo.findByVehicle_LicensePlate(vehicle.getLicensePlate()));
        vehicle.setSchedules(vehicleScheduleRepo.findBySchedule_vehicleModel(vehicle.getModel()));
        return vehicleRepo.save(vehicle);
    }

    // ==================== CÁC HÀM HELPER ====================
    private VehicleOverviewDTO mapToVehicleOverview(Vehicle vehicle) {
        VehicleOverviewDTO dto = new VehicleOverviewDTO();
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setCurrentKm(vehicle.getCurrentKm());
        return dto;
    }


    private BookingStatsDTO getBookingStats(Integer userId) {
        List<Booking> bookings = bookingRepo.findByCustomer_UserId(userId);
        BookingStatsDTO stats = new BookingStatsDTO();
        stats.setTotalBookings(bookings.size());
        stats.setPendingBookings((int) bookings.stream()
                .filter(b -> "Pending".equals(b.getStatus()) || "Approved".equals(b.getStatus()))
                .count());
        stats.setCompletedBookings((int) bookings.stream()
                .filter(b -> "Completed".equals(b.getStatus()))
                .count());
        bookings.stream()
                .map(Booking::getBookingDate)
                .max(LocalDateTime::compareTo)
                .ifPresent(stats::setLastBookingDate);
        return stats;
    }

    private CustomerInfoDTO mapToCustomerInfo(Users customer) {
        CustomerInfoDTO dto = new CustomerInfoDTO();
        dto.setUserId(customer.getUserId());
        dto.setFullName(customer.getFullName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        return dto;
    }


}