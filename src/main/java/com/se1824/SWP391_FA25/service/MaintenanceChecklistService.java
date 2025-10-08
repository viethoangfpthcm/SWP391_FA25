package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.transaction.Transactional;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Transactional
public class MaintenanceChecklistService {
   final MaintenanceChecklistRepository checklistRepo;
   final MaintenanceChecklistDetailRepository detailRepo;
   final BookingRepository bookingRepo;
   final MaintenancePlanItemRepository planItemRepo;
   final MaintenancePlanRepository planRepo;
   final PartRepository partRepo;

    public List<MaintenanceChecklist> getChecklistByCustomer(String customerId) {
        return checklistRepo.findByBooking_Customer_UserId(customerId);
    }

    public List<MaintenanceChecklist> getChecklistByTechnician(String technicianId) {
        return checklistRepo.findByTechnician_UserId(technicianId);
    }

    /**
     * Technician bắt đầu quá trình bảo dưỡng (Start Maintenance)
     * => cập nhật trạng thái checklist sang "In Progress" và tạo chi tiết.
     */
    public void startMaintenance(Integer bookingId) {
        // 1. Tìm hoặc khởi tạo Checklist
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElse(null);

        if (checklist == null) {
            var booking = bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

            // 2. LẤY MAINTENANCE PLAN TỪ VEHICLE'S SCHEDULE DỰA TRÊN KM
            MaintenancePlan plan = getApplicableMaintenancePlan(booking.getVehicle());

            if (plan == null) {
                throw new InvalidDataException("No applicable Maintenance Plan found for this vehicle/schedule based on current mileage.");
            }


            MaintenanceChecklist newChecklist = new MaintenanceChecklist();
            newChecklist.setBooking(booking);
            newChecklist.setTechnician(booking.getAssignedTechnician());
            newChecklist.setMaintenancePlan(plan);
            newChecklist.setStatus("In Progress");

            final MaintenanceChecklist savedChecklist = checklistRepo.save(newChecklist);

            // 4. Sinh checklist detail tự động từ MaintenancePlanItem
            List<MaintenancePlanItem> items = planItemRepo.findByPlan_Id(plan.getId());

            List<MaintenanceChecklistDetail> details = items.stream()
                    .map(item -> {
                        MaintenanceChecklistDetail detail = new MaintenanceChecklistDetail();
                        detail.setChecklist(savedChecklist);
                        detail.setPlanItem(item);
                        detail.setStatus("Pending");
                        return detail;
                    })
                    .toList();
            detailRepo.saveAll(details);

        } else {
            checklist.setStatus("In Progress");
            checklistRepo.save(checklist);
        }
    }

    // ---

    /**
     * Phương thức tìm MaintenancePlan áp dụng (Lấy plan có KM thấp nhất chưa thực hiện)
     * Sử dụng logic extractIntervalKm() để tìm Plan phù hợp với số KM hiện tại.
     */
    private MaintenancePlan getApplicableMaintenancePlan(Vehicle vehicle) {
        if (vehicle.getMaintenanceSchedule() == null) {
            return null;
        }

        Integer scheduleId = vehicle.getMaintenanceSchedule().getId();
        Integer currentKm = vehicle.getCurrentKm() != null ? vehicle.getCurrentKm() : 0;

        // Lấy tất cả các plan liên quan đến Schedule
        List<MaintenancePlan> plans = planRepo.findBySchedule_Id(scheduleId);

        MaintenancePlan fallBackPlan = null; // Plan lớn nhất,

        for (MaintenancePlan plan : plans) {
            Integer intervalKm = extractIntervalKm(plan.getName());

            if (intervalKm != null) {
                fallBackPlan = plan; // Cập nhật plan lớn nhất

                // Trả về Plan đầu tiên (thấp nhất) mà xe CHƯA ĐẠT MỐC
                if (currentKm < intervalKm) {
                    return plan;
                }
            }
        }

        // trả về Plan có mốc KM lớn nhất để thực hiện
        return fallBackPlan;
    }

    /**
     * Trích xuất mốc KM từ tên Plan (Ví dụ: "Bảo dưỡng 10.000 km")
     * Logic được lấy từ BookingService.
     */
    private Integer extractIntervalKm(String planName) {
        if (planName == null || planName.trim().isEmpty()) {
            return null;
        }

        try {
            // Tách chuỗi theo khoảng trắng
            String[] parts = planName.split(" ");
            for (int i = 0; i < parts.length - 1; i++) {
                // Nếu tìm thấy "km" và từ trước nó có vẻ là số
                if ("km".equalsIgnoreCase(parts[i + 1])) {
                    // Loại bỏ các ký tự phân cách hàng nghìn (.,)
                    String kmString = parts[i].replace(".", "").replace(",", "");
                    return Integer.parseInt(kmString);
                }
            }
        } catch (Exception e) {
            // Ghi log lỗi khi không parse được
            // Không nên throw exception ở đây, chỉ trả về null
            // vì có thể có các plan không đặt tên theo mốc KM
        }
        return null;
    }

    // ---

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, String status, String note, Integer partId) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));
        detail.setStatus(status);
        detail.setNote(note);
        if (partId != null) {

            Part part = partRepo.findById(partId)
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));
            detail.setPart(part);
        } else {
            detail.setPart(null);
        }

    }
    @Transactional
    public void updateCustomerApproval(Integer detailId, String approvalStatus, String customerNote) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));

        String standardizedStatus = approvalStatus.toUpperCase();
        if (!List.of("APPROVED", "DECLINED", "PENDING").contains(standardizedStatus)) {
            throw new InvalidDataException("Invalid approval status. Must be APPROVED, DECLINED, or PENDING.");
        }

        detail.setApprovalStatus(standardizedStatus);
        detail.setCustomerNote(customerNote);

        detailRepo.save(detail);


    }
}