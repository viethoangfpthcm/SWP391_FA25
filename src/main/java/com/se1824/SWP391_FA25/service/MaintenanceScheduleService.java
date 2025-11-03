package com.se1824.SWP391_FA25.service;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.MaintenancePlanItemRequest;
import com.se1824.SWP391_FA25.model.request.MaintenancePlanRequest;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduleService {
    private final UserRepository userRepo;

    private final MaintenanceScheduleRepository maintenanceScheduleRepo;
    private final MaintenancePlanRepository planRepo;
    private final VehicleScheduleRepository vehicleScheduleRepo;
    private final MaintenancePlanItemRepository planItemRepo;
    private final PartTypeRepository partTypeRepo;

    /**
     * Admin tạo MaintenanceSchedule mới (tương đương với việc tạo mẫu xe mới).
     */
    @Transactional
    public MaintenanceSchedule createMaintenanceSchedule(String name, String description, String vehicleModel, Integer adminId) {
        log.info("Admin {} creating new maintenance schedule for vehicle model: {}", adminId, vehicleModel);
        validateAdminRole(adminId);

        if (maintenanceScheduleRepo.findByVehicleModel(vehicleModel) != null) {
            throw new InvalidDataException("Vehicle Model " + vehicleModel + " already has a maintenance schedule.");
        }

        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .name(name)
                .description(description)
                .vehicleModel(vehicleModel)
                .build();

        MaintenanceSchedule savedSchedule = maintenanceScheduleRepo.save(schedule);
        log.info("Maintenance Schedule created successfully with ID: {} for model {}", savedSchedule.getId(), vehicleModel);
        return savedSchedule;
    }

    /**
     * Admin cập nhật thông tin MaintenanceSchedule.
     */
    @Transactional
    public MaintenanceSchedule updateMaintenanceSchedule(Integer scheduleId, String name, String description, Integer adminId) {
        log.info("Admin {} updating maintenance schedule ID: {}", adminId, scheduleId);
        validateAdminRole(adminId);
        MaintenanceSchedule schedule = maintenanceScheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Schedule not found with ID: " + scheduleId));
        if (name != null) {
            schedule.setName(name);
        }
        if (description != null) {
            schedule.setDescription(description);
        }
        return maintenanceScheduleRepo.save(schedule);
    }

    /**
     * Admin xóa MaintenanceSchedule (và các plans liên quan).
     * Cảnh báo: Việc này có thể ảnh hưởng đến các xe đang được gán lịch.
     */
    @Transactional
    public void deleteMaintenanceSchedule(Integer scheduleId, Integer adminId) {
        log.warn("Admin {} attempting to delete maintenance schedule ID: {}", adminId, scheduleId);
        validateAdminRole(adminId);

        MaintenanceSchedule schedule = maintenanceScheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Schedule not found with ID: " + scheduleId));

        if (vehicleScheduleRepo.existsBySchedule_Id(scheduleId)) {
            throw new InvalidDataException("Cannot delete schedule: One or more customer vehicles are currently assigned to this schedule.");
        }

        planRepo.deleteBySchedule_Id(scheduleId);

        maintenanceScheduleRepo.delete(schedule);
        log.info("Maintenance Schedule ID {} deleted successfully.", scheduleId);
    }

    /**
     * Admin lấy chi tiết một MaintenanceSchedule bằng ID
     */
    public MaintenanceSchedule getScheduleById(Integer scheduleId, Integer adminId) {
        log.info("Admin {} fetching schedule details for ID: {}", adminId, scheduleId);
        validateAdminRole(adminId);

        return maintenanceScheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Schedule not found with ID: " + scheduleId));
    }

    /**
     * Admin lấy tất cả MaintenanceSchedule (tất cả các mẫu xe)
     */
    public List<MaintenanceSchedule> getAllSchedules(Integer adminId) {
        log.info("Admin {} fetching all maintenance schedules", adminId);
        validateAdminRole(adminId);

        return maintenanceScheduleRepo.findAll();
    }

    /**
     * Admin tạo một Maintenance Plan mới (Cấp bảo dưỡng) cho một Schedule cụ thể.
     */
    @Transactional
    public MaintenancePlan createMaintenancePlan(MaintenancePlanRequest request, Integer adminId) {
        log.info("Admin {} creating new plan for schedule ID: {}", adminId, request.getScheduleId());
        validateAdminRole(adminId);

        MaintenanceSchedule schedule = maintenanceScheduleRepo.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Schedule not found with ID: " + request.getScheduleId()));

        if (planRepo.existsBySchedule_IdAndMaintenanceNo(request.getScheduleId(), request.getMaintenanceNo())) {
            throw new InvalidDataException("Maintenance number " + request.getMaintenanceNo() + " already exists in this schedule.");
        }

        MaintenancePlan plan = MaintenancePlan.builder()
                .schedule(schedule)
                .maintenanceNo(request.getMaintenanceNo())
                .intervalKm(request.getIntervalKm())
                .intervalMonth(request.getIntervalMonth())
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return planRepo.save(plan);
    }

    /**
     * Admin cập nhật MaintenancePlan (Cấp bảo dưỡng)
     */
    @Transactional
    public MaintenancePlan updateMaintenancePlan(Integer planId, MaintenancePlanRequest request, Integer adminId) {
        log.info("Admin {} updating plan ID: {}", adminId, planId);
        validateAdminRole(adminId);

        MaintenancePlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + planId));

        if (request.getName() != null) plan.setName(request.getName());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getIntervalKm() != null) plan.setIntervalKm(request.getIntervalKm());
        if (request.getIntervalMonth() != null) plan.setIntervalMonth(request.getIntervalMonth());

        return planRepo.save(plan);
    }

    /**
     * Admin xóa MaintenancePlan và tất cả PlanItem liên quan
     */
    @Transactional
    public void deleteMaintenancePlan(Integer planId, Integer adminId) {
        log.warn("Admin {} deleting maintenance plan ID: {}", adminId, planId);
        validateAdminRole(adminId);

        MaintenancePlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + planId));

        planItemRepo.deleteByPlan_Id(planId);

        planRepo.delete(plan);
        log.info("Maintenance Plan ID {} deleted successfully.", planId);
    }

    /**
     * Admin lấy chi tiết một MaintenancePlan bằng ID
     */
    public MaintenancePlan getPlanById(Integer planId, Integer adminId) {
        log.info("Admin {} fetching plan details for ID: {}", adminId, planId);
        validateAdminRole(adminId);

        return planRepo.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + planId));
    }

    /**
     * Admin lấy tất cả plan theo schedule ID
     */
    public List<MaintenancePlan> getPlansBySchedule(Integer scheduleId, Integer adminId) {
        log.info("Admin {} fetching plans for schedule ID: {}", adminId, scheduleId);
        validateAdminRole(adminId);

        return planRepo.findBySchedule_Id(scheduleId);
    }

    /**
     * Admin tạo mới một MaintenancePlanItem (hạng mục trong kế hoạch bảo dưỡng)
     */
    @Transactional
    public MaintenancePlanItem createMaintenancePlanItem(MaintenancePlanItemRequest request, Integer adminId) {
        log.info("Admin {} creating new plan item for plan ", adminId);
        validateAdminRole(adminId);

        MaintenancePlan plan = planRepo.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan not found with ID: " + request.getPlanId()));

        PartType partType = partTypeRepo.findById(request.getPart_type_id())
                .orElseThrow(() -> new ResourceNotFoundException("PartType not found with ID: " + request.getPart_type_id()));

        // Validate ActionType
        if (request.getActionType() == null) {
            throw new InvalidDataException("Action type must not be null.");
        }

        MaintenancePlanItem planItem = MaintenancePlanItem.builder()
                .plan(plan)
                .itemName(request.getItem_name())
                .actionType(request.getActionType())
                .partType(partType)
                .note(request.getNote())
                .build();

        MaintenancePlanItem savedItem = planItemRepo.save(planItem);
        log.info("Maintenance Plan Item created successfully with ID: {}", savedItem.getId());
        return savedItem;
    }

    /**
     * Admin cập nhật một MaintenancePlanItem
     */
    @Transactional
    public MaintenancePlanItem updateMaintenancePlanItem(Integer planItemId, MaintenancePlanItemRequest request, Integer adminId) {
        log.info("Admin {} updating plan item ID: {}", adminId, planItemId);
        validateAdminRole(adminId);
        MaintenancePlanItem item = planItemRepo.findById(planItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan Item not found with ID: " + planItemId));

        if (request.getPart_type_id() != null) {
            PartType partType = partTypeRepo.findById(request.getPart_type_id())
                    .orElseThrow(() -> new ResourceNotFoundException("PartType not found with ID: " + request.getPart_type_id()));
            item.setPartType(partType);
        }
        if (request.getItem_name() != null) {
            item.setItemName(request.getItem_name());
        }
        if (request.getActionType() != null) {
            item.setActionType(request.getActionType());
        }
        if (request.getNote() != null) {
            item.setNote(request.getNote());
        }

        // Lưu và trả về
        MaintenancePlanItem updatedItem = planItemRepo.save(item);
        log.info("Maintenance Plan Item ID {} updated successfully.", updatedItem.getId());
        return updatedItem;
    }

    /**
     * Admin xóa một MaintenancePlanItem
     */
    @Transactional
    public void deleteMaintenancePlanItem(Integer planItemId, Integer adminId) {
        log.warn("Admin {} attempting to delete plan item ID: {}", adminId, planItemId);
        validateAdminRole(adminId);

        MaintenancePlanItem item = planItemRepo.findById(planItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Plan Item not found with ID: " + planItemId));
        planItemRepo.delete(item);

        log.info("Maintenance Plan Item ID {} deleted successfully.", planItemId);
    }

    public List<MaintenancePlanItem> getPlanItemsByPlan(Integer planId, Integer adminId) {
        validateAdminRole(adminId);
        log.info("Fetching plan items for plan ID: {}", planId);
        if (!planRepo.existsById(planId)) {
            throw new ResourceNotFoundException("Maintenance Plan not found with ID: " + planId);
        }

        return planItemRepo.findByPlan_Id(planId);
    }

    /**
     * Lấy chi tiết một MaintenancePlanItem bằng ID của nó
     */

    private void validateAdminRole(Integer userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + userId));
        if (user.getRole() != UserRole.ADMIN) {
            throw new InvalidDataException("Only ADMIN can perform this action");
        }
    }
}
