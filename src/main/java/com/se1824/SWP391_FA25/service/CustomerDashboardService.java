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
import java.util.Comparator;
import java.util.List;
import java.util.Set;
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
        Integer currentKm = vehicle.getCurrentKm() != null ? vehicle.getCurrentKm() : 0;

        // Lấy danh sách các lần đã hoàn thành
        Set<Integer> completedMaintenanceNos = bookingRepo.findByVehicle_LicensePlateAndStatus(licensePlate, "Paid")
                .stream()
                .filter(booking -> booking.getMaintenancePlan() != null)
                .map(booking -> booking.getMaintenancePlan().getMaintenanceNo())
                .collect(Collectors.toSet());

        // Sắp xếp plans theo maintenanceNo
        List<MaintenancePlan> sortedPlans = plans.stream()
                .sorted(Comparator.comparing(MaintenancePlan::getMaintenanceNo))
                .toList();

        // Tìm maintenance number lớn nhất đã hoàn thành
        Integer maxCompletedNo = completedMaintenanceNos.stream()
                .max(Integer::compareTo)
                .orElse(0);

        // Tìm lần đầu tiên SAU maxCompletedNo mà chưa hoàn thành
        // Đây chính là lần NEXT_TIME
        Integer nextTimeNo = null;
        for (MaintenancePlan plan : sortedPlans) {
            Integer planNo = plan.getMaintenanceNo();
            if (planNo > maxCompletedNo && !completedMaintenanceNos.contains(planNo)) {
                nextTimeNo = planNo;
                break;
            }
        }

        // Nếu không tìm thấy (tất cả đã hoàn thành), tìm lần tiếp theo trong danh sách
        if (nextTimeNo == null) {
            nextTimeNo = maxCompletedNo + 1;
        }

        final Integer finalNextTimeNo = nextTimeNo;

        return sortedPlans.stream().map(plan -> {
            VehicleScheduleStatusDTO dto = new VehicleScheduleStatusDTO();
            dto.setMaintenancePlanId(plan.getId());
            dto.setPlanName(plan.getName());
            dto.setDescription(plan.getDescription());
            dto.setIntervalKm(plan.getIntervalKm());

            LocalDate dueDate = purchaseDate.plusMonths(plan.getIntervalMonth());
            Integer dueKm = plan.getIntervalKm();
            Integer planNo = plan.getMaintenanceNo();

            // Xác định trạng thái
            if (completedMaintenanceNos.contains(planNo)) {
                // Đã hoàn thành
                dto.setStatus("ON_TIME");

            } else if (planNo.equals(finalNextTimeNo)) {
                // Đây là lần kế tiếp có thể đặt lịch
                dto.setStatus("NEXT_TIME");

            } else if (planNo < finalNextTimeNo) {
                // Các lần trước nextTimeNo mà chưa hoàn thành = EXPIRED (đã bị bỏ qua/skip)
                dto.setStatus("EXPIRED");

            } else {
                // Các lần sau nextTimeNo = LOCKED (chưa thể đặt vì nextTime chưa xong)
                dto.setStatus("LOCKED");
            }

            return dto;
        }).collect(Collectors.toList());
    }

    /*
     * Customer theo xe mới
     */
    public Vehicle createVehicle(Vehicle vehicle) {
        Users currentUser = authenticationService.getCurrentAccount();

        // 1. Gán chủ sở hữu
        vehicle.setOwner(currentUser);
        // Đảm bảo các thuộc tính List (bookings, schedules) là null khi save object mới
        // và không gán các giá trị fetch từ repository vào đối tượng transient

        // 2. Lưu Vehicle vào DB để lấy primary key (licensePlate)
        Vehicle savedVehicle = vehicleRepo.save(vehicle); //

        // 3. Tìm MaintenanceSchedule mặc định cho dòng xe
        MaintenanceSchedule schedule = maintenanceScheduleRepo.findByVehicleModel(savedVehicle.getModel()); //

        if (schedule != null) {
            // 4. Tạo đối tượng VehicleSchedule mới để liên kết
            VehicleSchedule newVehicleSchedule = VehicleSchedule.builder()
                    .vehicle(savedVehicle) //
                    .schedule(schedule) //
                    .maintenanceNo(0) // Khởi tạo mốc bảo dưỡng đầu tiên (có thể điều chỉnh)
                    .planDate(LocalDate.now())
                    .deadline(LocalDate.now().plusMonths(1)) // Ví dụ: Deadline sau 1 năm
                    .status("PENDING") // Trạng thái ban đầu: PENDING
                    .build(); //

            vehicleScheduleRepo.save(newVehicleSchedule); //
        }

        return savedVehicle;
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