package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.CustomerDashboardDTO;
import com.se1824.SWP391_FA25.dto.CustomerInfoDTO;
import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.entity.Vehicle;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.repository.BookingRepository;
import com.se1824.SWP391_FA25.repository.MaintenancePlanRepository;
import com.se1824.SWP391_FA25.repository.UserRepository;
import com.se1824.SWP391_FA25.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.se1824.SWP391_FA25.dto.VehicleOverviewDTO;
import com.se1824.SWP391_FA25.dto.MaintenanceReminderDTO;
import com.se1824.SWP391_FA25.dto.BookingStatsDTO;
import com.se1824.SWP391_FA25.entity.MaintenancePlan;


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

    public CustomerDashboardDTO getDashboard() {
        AuthenticationService authentication = new AuthenticationService();
        Users currentUser = authentication.getCurrentAccount();
        CustomerDashboardDTO dashboard = new CustomerDashboardDTO();

        // Get customer info

        dashboard.setCustomerInfo(mapToCustomerInfo(currentUser));

        // Get vehicles
        List<Vehicle> vehicles = vehicleRepo.findByOwner_UserId(currentUser.getUserId());
        dashboard.setVehicles(vehicles.stream()
                .map(this::mapToVehicleOverview)
                .collect(Collectors.toList()));

        // Get maintenance reminders
        dashboard.setUpcomingMaintenance(
                generateMaintenanceReminders(vehicles));

        // Get booking stats
        dashboard.setBookingStats(getBookingStats(currentUser.getUserId()));

        return dashboard;
    }

    private VehicleOverviewDTO mapToVehicleOverview(Vehicle vehicle) {
        VehicleOverviewDTO dto = new VehicleOverviewDTO();
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setCurrentKm(vehicle.getCurrentKm());

        if (vehicle.getMaintenanceSchedule() != null) {
            dto.setScheduleId(vehicle.getMaintenanceSchedule().getId());
            dto.setScheduleName(vehicle.getMaintenanceSchedule().getName());
            dto.setNextMaintenance(calculateNextMaintenance(vehicle));
        }

        return dto;
    }

    private NextMaintenanceDTO calculateNextMaintenance(Vehicle vehicle) {
        Integer currentKm = vehicle.getCurrentKm();
        Integer scheduleId = vehicle.getMaintenanceSchedule().getId();

        // Tìm plan tiếp theo dựa vào current_km
        List<MaintenancePlan> plans = planRepo
                .findBySchedule_Id(scheduleId);

        for (MaintenancePlan plan : plans) {
            // Parse interval từ tên plan (VD: "Bảo dưỡng 12.000 km / 12 tháng")
            Integer intervalKm = extractIntervalKm(plan.getName());

            if (currentKm < intervalKm) {
                NextMaintenanceDTO dto = new NextMaintenanceDTO();
                dto.setPlanId(plan.getId());
                dto.setPlanName(plan.getName());
                dto.setIntervalKm(intervalKm);
                dto.setKmUntilMaintenance(intervalKm - currentKm);

                // Xác định status
                int kmLeft = intervalKm - currentKm;
                if (kmLeft < 0) {
                    dto.setStatus("OVERDUE");
                } else if (kmLeft <= 1000) {
                    dto.setStatus("DUE_SOON");
                } else {
                    dto.setStatus("OK");
                }

                return dto;
            }
        }

        return null;
    }

    private List<MaintenanceReminderDTO> generateMaintenanceReminders(
            List<Vehicle> vehicles) {
        List<MaintenanceReminderDTO> reminders = new ArrayList<>();

        for (Vehicle vehicle : vehicles) {
            NextMaintenanceDTO nextMaintenance =
                    calculateNextMaintenance(vehicle);

            if (nextMaintenance != null) {
                MaintenanceReminderDTO reminder = new MaintenanceReminderDTO();
                reminder.setLicensePlate(vehicle.getLicensePlate());
                reminder.setModel(vehicle.getModel());
                reminder.setCurrentKm(vehicle.getCurrentKm());
                reminder.setNextMaintenanceKm(nextMaintenance.getIntervalKm());

                String status = nextMaintenance.getStatus();
                if ("OVERDUE".equals(status)) {
                    reminder.setSeverity("CRITICAL");
                    reminder.setMessage("Xe đã quá hạn bảo dưỡng " +
                            Math.abs(nextMaintenance.getKmUntilMaintenance()) + " km!");
                } else if ("DUE_SOON".equals(status)) {
                    reminder.setSeverity("WARNING");
                    reminder.setMessage("Xe sắp đến hạn bảo dưỡng, còn " +
                            nextMaintenance.getKmUntilMaintenance() + " km");
                } else {
                    reminder.setSeverity("INFO");
                    reminder.setMessage("Lần bảo dưỡng tiếp theo còn " +
                            nextMaintenance.getKmUntilMaintenance() + " km");
                }

                reminders.add(reminder);
            }
        }

        return reminders;
    }

    private BookingStatsDTO getBookingStats(String userId) {
        List<Booking> bookings = bookingRepo.findByCustomer_UserId(userId);

        BookingStatsDTO stats = new BookingStatsDTO();
        stats.setTotalBookings(bookings.size());
        stats.setPendingBookings((int) bookings.stream()
                .filter(b -> "Pending".equals(b.getStatus()) ||
                        "Approved".equals(b.getStatus()))
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

    private Integer extractIntervalKm(String planName) {
        if (planName == null || planName.trim().isEmpty()) {
            throw new InvalidDataException("Plan name cannot be null or empty");
        }

        try {
            String[] parts = planName.split(" ");
            for (int i = 0; i < parts.length - 1; i++) {
                if (parts[i].contains(".") && "km".equals(parts[i + 1])) {
                    String kmValue = parts[i].replace(".", "").replace(",", "");
                    return Integer.parseInt(kmValue);
                }
            }
            // Không tìm thấy km trong plan name
            throw new InvalidDataException("Invalid plan name format: " + planName);
        } catch (NumberFormatException e) {
            throw new InvalidDataException("Cannot parse km value from plan name: " + planName);
        }
    }
}