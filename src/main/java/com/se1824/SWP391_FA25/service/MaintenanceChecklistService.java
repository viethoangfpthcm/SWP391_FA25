package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.PartOption;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.UserRole;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.repository.*;
import jakarta.transaction.Transactional;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
@Slf4j
public class MaintenanceChecklistService {
    MaintenanceChecklistRepository checklistRepo;
    MaintenanceChecklistDetailRepository detailRepo;
    BookingRepository bookingRepo;
    MaintenancePlanItemRepository planItemRepo;
    MaintenancePlanRepository planRepo;
    PartRepository partRepo;
    ModelMapper modelMapper;
    VehicleRepository vehicleRepo;
    AuthenticationService authService;
    String STATUS_ADJUSTMENT = "HIỆU_CHỈNH";
    String STATUS_REPAIR = "SỬA_CHỮA";
    String STATUS_REPLACE = "THAY_THẾ";
    String STATUS_GOOD = "TỐT";


    /**
     * Trả về chi phí nhân công cố định cho các hạng mục không dùng Part.
     */
    private BigDecimal getStandardLaborCost(String status) {
        if (STATUS_ADJUSTMENT.equalsIgnoreCase(status)) {

            return BigDecimal.ZERO;
        }
        if (STATUS_REPAIR.equalsIgnoreCase(status)) {
            // Chi phí cố định cho sửa chữa (4.000.000 VND)
            return new BigDecimal("4000000");
        }
        return BigDecimal.ZERO;
    }


    /**
     * Lấy Checklist cho Technician đang đăng nhập
     */
    public List<MaintenanceChecklistResponse> getChecklistByCurrentTechnician() {
        Users currentTechnician = authService.getCurrentAccount();

        if (currentTechnician.getRole() != UserRole.TECHNICIAN) {
            throw new InvalidDataException("Only technicians can access this resource");
        }

        List<MaintenanceChecklist> checklists = checklistRepo.findByTechnician_UserId(currentTechnician.getUserId());
        return checklists.stream()
                .map(this::mapChecklistToResponseWithDetails)
                .collect(Collectors.toList());
    }


    /**
     * Lấy Checklist cho Customer
     */
    @Autowired
    AuthenticationService authenticationService;

    public List<MaintenanceChecklistResponse> getChecklistByCustomer() {
        Users currentUser = authenticationService.getCurrentAccount();
        List<MaintenanceChecklist> checklists = checklistRepo.findByBooking_Customer_UserId(currentUser.getUserId());
        // Sử dụng hàm helper chung
        return checklists.stream().map(this::mapChecklistToResponseWithDetails).collect(Collectors.toList());
    }

    public MaintenanceChecklistResponse getChecklistByCustomerAndId(Integer bookingId) {
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId).orElse(null);

        return mapChecklistToResponseWithDetails(checklist);
    }

    /**
     * Hàm helper chung để map Checklist Entity sang Response DTO và tính toán tổng chi phí.
     */
    private MaintenanceChecklistResponse mapChecklistToResponseWithDetails(MaintenanceChecklist checklist) {
        if (checklist == null) return null;

        MaintenanceChecklistResponse res = modelMapper.map(checklist, MaintenanceChecklistResponse.class);

        if (checklist.getBooking() != null && checklist.getBooking().getVehicle() != null) {
            Vehicle vehicle = checklist.getBooking().getVehicle();
            res.setVehicleNumberPlate(vehicle.getLicensePlate());
            res.setVehicleModel(vehicle.getModel());
            res.setCurrentKm(checklist.getActualKm() != null ? checklist.getActualKm() : vehicle.getCurrentKm());
        }

        if (checklist.getPlan() != null) {
            res.setPlanName(checklist.getPlan().getName());
            res.setMaintenanceKm(checklist.getPlan().getIntervalKm());
        }

        List<MaintenanceChecklistDetailResponse> details = mapDetailsToResponse(checklist);
        res.setDetails(details);

        BigDecimal totalApproved = BigDecimal.ZERO;
        BigDecimal totalDeclined = BigDecimal.ZERO;
        BigDecimal estimatedTotal = BigDecimal.ZERO;

        for (MaintenanceChecklistDetailResponse detail : details) {
            BigDecimal cost = Optional.ofNullable(detail.getLaborCost()).orElse(BigDecimal.ZERO)
                    .add(Optional.ofNullable(detail.getMaterialCost()).orElse(BigDecimal.ZERO));
            if ("APPROVED".equalsIgnoreCase(detail.getApprovalStatus())) {
                totalApproved = totalApproved.add(cost);
            } else if ("DECLINED".equalsIgnoreCase(detail.getApprovalStatus())) {
                totalDeclined = totalDeclined.add(cost);
            }
            estimatedTotal = estimatedTotal.add(cost);
        }

        res.setTotalCostApproved(totalApproved);
        res.setTotalCostDeclined(totalDeclined);
        res.setEstimatedCost(estimatedTotal);

        return res;
    }

    /**
     * Technician bắt đầu quá trình bảo dưỡng (Start Maintenance) (ĐÃ CẬP NHẬT LOGIC)
     */
    public void startMaintenance(Integer bookingId, Integer actualKm) {
        if (checklistRepo.findByBooking_BookingId(bookingId).isPresent()) {
            MaintenanceChecklist existingChecklist = checklistRepo.findByBooking_BookingId(bookingId).get();
            existingChecklist.setStatus("In Progress");
            checklistRepo.save(existingChecklist);

            Booking booking = bookingRepo.findById(bookingId) // Lấy lại Booking và đổi trạng thái booking thành "In Progress"
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
            booking.setStatus("In Progress");
            bookingRepo.save(booking);
            return;
        }

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        Vehicle vehicle = booking.getVehicle();

        if (actualKm < (vehicle.getCurrentKm() != null ? vehicle.getCurrentKm() : 0)) {
            throw new InvalidDataException("Actual KM cannot be less than the vehicle's current KM.");
        }
        vehicle.setCurrentKm(actualKm);
        vehicleRepo.save(vehicle);

        MaintenancePlan applicablePlan = getApplicableMaintenancePlan(vehicle);
        if (applicablePlan == null) {
            throw new InvalidDataException("No applicable Maintenance Plan found for this vehicle based on actual mileage.");
        }

        if (!applicablePlan.getId().equals(booking.getMaintenancePlan().getId())) {
            log.warn("Mismatched Maintenance Plan for Booking ID {}. Customer chose Plan {}, but Actual KM {} requires Plan {}. Updating...",
                    bookingId, booking.getMaintenancePlan().getId(), actualKm, applicablePlan.getId());
            booking.setMaintenancePlan(applicablePlan);
            bookingRepo.save(booking);
        }

        MaintenanceChecklist newChecklist = new MaintenanceChecklist();
        newChecklist.setBooking(booking);
        newChecklist.setTechnician(booking.getAssignedTechnician());
        newChecklist.setPlan(applicablePlan);
        newChecklist.setActualKm(actualKm);
        newChecklist.setStatus("In Progress");
        newChecklist.setStartTime(LocalDateTime.now()); // Ghi lại thời gian bắt đầu
        newChecklist.setMaintenanceNo(applicablePlan.getMaintenanceNo()); // Gán maintenanceNo từ plan

        booking.setStatus("In Progress");// Đổi trạng thái booking thành "In Progress" nếu chưa có checklist
        bookingRepo.save(booking);

        final MaintenanceChecklist savedChecklist = checklistRepo.save(newChecklist);

        List<MaintenancePlanItem> items = planItemRepo.findByPlan_Id(applicablePlan.getId());
        List<MaintenanceChecklistDetail> details = items.stream()
                .map(item -> {
                    MaintenanceChecklistDetail detail = new MaintenanceChecklistDetail();
                    detail.setChecklist(savedChecklist);
                    detail.setPlanItem(item);
                    detail.setStatus("Pending");
                    detail.setLaborCost(BigDecimal.ZERO);
                    detail.setMaterialCost(BigDecimal.ZERO);
                    return detail;
                })
                .toList();
        detailRepo.saveAll(details);

    }


    /**
     * Hàm helper để map chi tiết checklist ra response
     */
    private List<MaintenanceChecklistDetailResponse> mapDetailsToResponse(MaintenanceChecklist checklist) {
        Integer serviceCenterId = checklist.getBooking().getServiceCenter().getId();

        return detailRepo.findByChecklist_Id(checklist.getId())
                .stream()
                .map(detail -> {
                    MaintenanceChecklistDetailResponse detailRes = new MaintenanceChecklistDetailResponse();
                    modelMapper.map(detail, detailRes);

                    if (detail.getPlanItem() != null) {
                        detailRes.setItemName(detail.getPlanItem().getItemName());
                        detailRes.setActionType(detail.getPlanItem().getActionType());

                        Integer partTypeId = detail.getPlanItem().getPartType().getId();
                        if (partTypeId != null) {
                            List<Part> availableParts = partRepo.findByPartType_IdAndServiceCenter_Id(partTypeId, serviceCenterId);
                            List<PartOption> partOptions = availableParts.stream()
                                    .filter(part -> part.getQuantity() > 0)
                                    .map(part -> modelMapper.map(part, PartOption.class))
                                    .collect(Collectors.toList());
                            detailRes.setAvailableParts(partOptions);
                        } else {
                            detailRes.setAvailableParts(Collections.emptyList());
                        }
                    }

                    if (detail.getPart() != null) {
                        detailRes.setPartName(detail.getPart().getName());
                    }
                    return detailRes;
                })
                .collect(Collectors.toList());
    }

    /**
     * Phương thức tìm MaintenancePlan áp dụng (Lấy plan có KM thấp nhất chưa thực hiện)
     *
     */
    private MaintenancePlan getApplicableMaintenancePlan(Vehicle vehicle) {
        MaintenanceSchedule schedule = vehicle.getSchedules().stream()
                .findFirst()
                .map(VehicleSchedule::getSchedule)
                .orElse(null);
        if (schedule == null) return null;

        List<MaintenancePlan> plans = planRepo.findBySchedule_Id(schedule.getId());
        Integer currentKm = vehicle.getCurrentKm();

        MaintenancePlan applicablePlan = null;
        for (MaintenancePlan plan : plans) {
            if (currentKm < plan.getIntervalKm()) {
                applicablePlan = plan;
                break;
            }
            applicablePlan = plan;
        }
        return applicablePlan;
    }

    // ---

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, String status, String note, Integer partId, Integer currentUserId) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));

        if (!detail.getChecklist().getTechnician().getUserId().equals(currentUserId)) {
            throw new InvalidDataException("You are not the assigned technician for this checklist.");
        }

        detail.setStatus(status);
        detail.setNote(note);
        detail.setPart(null);
        detail.setLaborCost(BigDecimal.ZERO);
        detail.setMaterialCost(BigDecimal.ZERO);

        if (STATUS_REPLACE.equalsIgnoreCase(status) && partId != null) {
            Part part = partRepo.findById(partId)
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

            if (part.getQuantity() <= 0) {
                throw new InvalidDataException("Part is out of stock: " + part.getName());
            }

            detail.setPart(part);
            detail.setLaborCost(Optional.ofNullable(part.getLaborCost()).orElse(BigDecimal.ZERO));
            detail.setMaterialCost(Optional.ofNullable(part.getMaterialCost()).orElse(BigDecimal.ZERO));

        } else if (STATUS_ADJUSTMENT.equalsIgnoreCase(status) || STATUS_REPAIR.equalsIgnoreCase(status)) {
            detail.setLaborCost(getStandardLaborCost(status));
        }

        detailRepo.save(detail);
        log.info("Updated checklist detail successfully");
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

    /**
     * Hoàn thành checklist (Complete Checklist)
     */
    @Transactional
    public void completeChecklist(Integer checklistId) {
        MaintenanceChecklist checklist = checklistRepo.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found."));

        if (!"In Progress".equalsIgnoreCase(checklist.getStatus())) {
            throw new InvalidDataException("Checklist must be 'In Progress' to complete.");
        }

        List<MaintenanceChecklistDetail> detailsToProcess = detailRepo.findByChecklist_IdAndApprovalStatus(checklistId, "APPROVED");

        for (MaintenanceChecklistDetail detail : detailsToProcess) {
            if (STATUS_REPLACE.equalsIgnoreCase(detail.getStatus()) && detail.getPart() != null) {
                Part part = detail.getPart();
                if (part.getQuantity() <= 0) {
                    log.error("Part out of stock during checklist completion: {}", part.getName());
                    throw new InvalidDataException("Part " + part.getName() + " is currently out of stock. Cannot complete task.");
                }
                part.setQuantity(part.getQuantity() - 1);
                partRepo.save(part);
            }
        }
        checklist.setEndTime(LocalDateTime.now()); // Ghi lại thời gian kết thúc

        checklist.setStatus("Completed");
        checklistRepo.save(checklist);
    }
    // *** THÊM PHƯƠNG THỨC MỚI CHO STAFF ***

    /**
     * Lấy chi tiết Checklist theo Booking ID cho Staff (kiểm tra center)
     *
     * @param bookingId ID của Booking
     * @return MaintenanceChecklistResponse DTO
     * @throws ResourceNotFoundException Nếu không tìm thấy Checklist
     * @throws AccessDeniedException     Nếu Staff không thuộc trung tâm quản lý Checklist đó
     */
    public MaintenanceChecklistResponse getChecklistByBookingIdForStaff(Integer bookingId) {
        log.info("Staff attempting to retrieve checklist for booking ID: {}", bookingId);

        // Lấy thông tin Staff đang đăng nhập
        Users currentStaff = authenticationService.getCurrentAccount();
        if (currentStaff == null || currentStaff.getRole() != UserRole.STAFF || currentStaff.getCenter() == null) {
            log.warn("Unauthorized access attempt for checklist by booking ID: {}. User not STAFF or missing center.", bookingId);
            throw new AccessDeniedException("User is not authorized or not associated with a service center.");
        }
        Integer staffCenterId = currentStaff.getCenter().getId();

        // Tìm Checklist dựa trên bookingId
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> {
                    log.warn("Checklist not found for booking ID: {}", bookingId);
                    return new ResourceNotFoundException("Checklist not found for booking ID: " + bookingId);
                });

        // Kiểm tra xem Checklist có thuộc trung tâm của Staff không
        Integer checklistCenterId = checklist.getBooking().getServiceCenter().getId();
        if (!staffCenterId.equals(checklistCenterId)) {
            log.warn("Access denied for staff {} (center {}) trying to access checklist for booking ID {} (center {})",
                    currentStaff.getUserId(), staffCenterId, bookingId, checklistCenterId);
            throw new AccessDeniedException("Staff does not have permission to view checklists for this service center.");
        }

        log.info("Staff {} (center {}) successfully retrieved checklist for booking ID {} (center {})",
                currentStaff.getUserId(), staffCenterId, bookingId, checklistCenterId);

        // Sử dụng lại hàm map đã có để trả về DTO
        return mapChecklistToResponseWithDetails(checklist);
    }
}