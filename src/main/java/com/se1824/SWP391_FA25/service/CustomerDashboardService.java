package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDashboardService {

    private final VehicleRepository vehicleRepo;
    private final BookingRepository bookingRepo;
    private final MaintenancePlanRepository planRepo;
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
        LocalDate currentDate = LocalDate.now();

        // *** LẤY KM HIỆN TẠI CỦA XE ***
        Integer currentKm = vehicle.getCurrentKm();


        // Tất cả VehicleSchedule của xe này
        List<VehicleSchedule> vehicleSchedules = vehicleScheduleRepo.findByVehicle_LicensePlate(licensePlate);
        Map<Integer, VehicleSchedule> scheduleMap = vehicleSchedules.stream()
                .collect(Collectors.toMap(VehicleSchedule::getMaintenanceNo, vs -> vs));

        // Các maintenanceNo đã hoàn thành
        Set<Integer> completedMaintenanceNos = bookingRepo.findByVehicle_LicensePlateAndStatus(licensePlate, "Completed")
                .stream()
                .filter(booking -> booking.getMaintenancePlan() != null)
                .map(booking -> booking.getMaintenancePlan().getMaintenanceNo())
                .collect(Collectors.toSet());

        // Sắp xếp plans
        List<MaintenancePlan> sortedPlans = plans.stream()
                .sorted(Comparator.comparing(MaintenancePlan::getMaintenanceNo))
                .toList();

        // Đã xóa logic finalNextTimeNo

        return sortedPlans.stream().map(plan -> {
            VehicleScheduleStatusDTO dto = new VehicleScheduleStatusDTO();
            dto.setMaintenancePlanId(plan.getId());
            dto.setPlanName(plan.getName());
            dto.setDescription(plan.getDescription());
            dto.setIntervalKm(plan.getIntervalKm());
            dto.setIntervalMonth(plan.getIntervalMonth());

            Integer planNo = plan.getMaintenanceNo();
            VehicleSchedule vehicleSchedule = scheduleMap.get(planNo);

            LocalDate planDate;
            LocalDate deadline;

            // Nếu có VehicleSchedule thì dùng giá trị thực tế
            if (vehicleSchedule != null) {
                planDate = vehicleSchedule.getPlanDate();
                deadline = vehicleSchedule.getDeadline();
            } else {
                planDate = vehicle.getPurchaseDate().plusMonths(plan.getIntervalMonth());
                deadline = planDate.plusMonths(1);
            }
            dto.setPlanDate(planDate);
            dto.setDeadline(deadline);
            String newStatus;

            if (completedMaintenanceNos.contains(planNo)) {
                newStatus = "ON_TIME"; // Đã hoàn thành
            } else {


                // Check 1: Overdue by date
                boolean overdueByDate = currentDate.isAfter(deadline);

                // Check 2: Overdue by KM (null-safe)
                boolean overdueByKm = false;
                Integer intervalKm = plan.getIntervalKm();

                if (currentKm != null && intervalKm != null) {
                    if (currentKm > intervalKm) {
                        overdueByKm = true;
                    }
                }

                // Combine checks: Overdue if EITHER date OR KM is exceeded
                if (overdueByDate || overdueByKm) {
                    newStatus = "OVERDUE";
                } else {
                    newStatus = "NEXT_TIME";
                }

            }

            dto.setStatus(newStatus);

            // Cập nhật DB nếu trạng thái thay đổi
            if (vehicleSchedule != null && !Objects.equals(vehicleSchedule.getStatus(), newStatus)) {
                vehicleSchedule.setStatus(newStatus);
                vehicleScheduleRepo.save(vehicleSchedule);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    /*
     * Customer theo xe mới
     */
    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicleRepo.findByLicensePlate(vehicle.getLicensePlate()) != null) {
            throw new EntityExistsException("Vehicle with license plate " + vehicle.getLicensePlate() + " already exists.");
        }
        Users currentUser = authenticationService.getCurrentAccount();
        vehicle.setOwner(currentUser);

        // Lưu vehicle trước
        Vehicle savedVehicle = vehicleRepo.save(vehicle);

        // Tìm MaintenanceSchedule cho dòng xe
        MaintenanceSchedule schedule = maintenanceScheduleRepo.findByVehicleModel(savedVehicle.getModel());

        if (schedule != null) {
            // Lấy tất cả các maintenance plans của schedule này
            List<MaintenancePlan> plans = planRepo.findBySchedule_Id(schedule.getId());

            // Sắp xếp theo maintenanceNo
            plans.sort(Comparator.comparing(MaintenancePlan::getMaintenanceNo));

            // Tạo VehicleSchedule cho TỪNG maintenance plan
            for (MaintenancePlan plan : plans) {
                LocalDate planDate = savedVehicle.getPurchaseDate()
                        .plusMonths(plan.getIntervalMonth());

                // Deadline = planDate + buffer time
                LocalDate deadline = planDate.plusMonths(1);

                VehicleSchedule vehicleSchedule = VehicleSchedule.builder()
                        .vehicle(savedVehicle)
                        .schedule(schedule)
                        .maintenanceNo(plan.getMaintenanceNo())
                        .planDate(planDate)  // Ngày dự kiến dựa trên purchaseDate + intervalMonth
                        .deadline(deadline)   // Hạn chót = planDate + buffer
                        .status("PENDING")
                        .build();

                vehicleScheduleRepo.save(vehicleSchedule);
            }
        }

        return savedVehicle;
    }


    /*
     * customer xóa xe có trong account của mình
     * */
    public void deleteVehicle(String licensePlate) {
        Users currentUser = authenticationService.getCurrentAccount();
        Vehicle vehicle = vehicleRepo.findById(licensePlate)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + licensePlate));

        if (!vehicle.getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new SecurityException("You do not have permission to delete this vehicle.");
        }

        vehicleRepo.delete(vehicle);
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