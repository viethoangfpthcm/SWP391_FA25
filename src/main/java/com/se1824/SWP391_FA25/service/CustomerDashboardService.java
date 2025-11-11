package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.*;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.BookingStatus;
import com.se1824.SWP391_FA25.enums.VehicleScheduleStatus;
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
        dashboard.setCustomerInfo(mapToCustomerInfo(currentUser));
        List<Vehicle> vehicles = vehicleRepo.findByOwner_UserId(currentUser.getUserId());
        dashboard.setVehicles(vehicles.stream()
                .map(this::mapToVehicleOverview)
                .collect(Collectors.toList()));

        dashboard.setBookingStats(getBookingStats(currentUser.getUserId()));
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

        Integer currentKm = vehicle.getCurrentKm();
        // Tất cả VehicleSchedule của xe này
        List<VehicleSchedule> vehicleSchedules = vehicleScheduleRepo.findByVehicle_LicensePlate(licensePlate);
        Map<Integer, VehicleSchedule> scheduleMap = vehicleSchedules.stream()
                .collect(Collectors.toMap(VehicleSchedule::getMaintenanceNo, vs -> vs));
        // Các maintenanceNo đã hoàn thành
        Set<Integer> completedMaintenanceNos = bookingRepo.findByVehicle_LicensePlateAndStatus(licensePlate, BookingStatus.COMPLETED)
                .stream()
                .filter(booking -> booking.getMaintenancePlan() != null)
                .map(booking -> booking.getMaintenancePlan().getMaintenanceNo())
                .collect(Collectors.toSet());
        // Sắp xếp plans
        List<MaintenancePlan> sortedPlans = plans.stream()
                .sorted(Comparator.comparing(MaintenancePlan::getMaintenanceNo))
                .toList();
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
            VehicleScheduleStatus newStatus;
            if (completedMaintenanceNos.contains(planNo)) {
                newStatus = VehicleScheduleStatus.ON_TIME; // Đã hoàn thành
            } else {
                boolean overdueByDate = currentDate.isAfter(deadline);
                boolean overdueByKm = false;
                Integer intervalKm = plan.getIntervalKm();
                if (currentKm != null && intervalKm != null) {
                    if (currentKm > intervalKm) {
                        overdueByKm = true;
                    }
                }
                if (overdueByDate || overdueByKm) {
                    newStatus = VehicleScheduleStatus.OVERDUE;
                } else {
                    newStatus = VehicleScheduleStatus.NEXT_TIME;
                }
            }
            dto.setStatus(newStatus.name());
            // Cập nhật DB nếu trạng thái thay đổi
            if (vehicleSchedule != null && !Objects.equals(vehicleSchedule.getStatus(), newStatus)) {
                vehicleSchedule.setStatus(newStatus);
                vehicleScheduleRepo.save(vehicleSchedule);
            }
            return dto;
        }).collect(Collectors.toList());
    }
    /**
     * Lấy danh sách tất cả các Model xe đã có lịch bảo dưỡng trên hệ thống
     */
    public List<String> getAvailableVehicleModels() {
        List<MaintenanceSchedule> schedules = maintenanceScheduleRepo.findAll();

        return schedules.stream()
                .map(MaintenanceSchedule::getVehicleModel)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
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
                        .status(VehicleScheduleStatus.PENDING)
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
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                .count());
        stats.setCompletedBookings((int) bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
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