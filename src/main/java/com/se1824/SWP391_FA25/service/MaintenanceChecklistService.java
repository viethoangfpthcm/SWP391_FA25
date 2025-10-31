package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.PartOption;
import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.ChecklistDetailUpdateRequest;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistSummaryResponse;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
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
    static ConcurrentHashMap<Integer, Object> checklistLocks = new ConcurrentHashMap<>();
    /**
     * Lấy danh sách Checklist TÓM TẮT cho Technician đang đăng nhập
     */
    public List<MaintenanceChecklistSummaryResponse> getChecklistByCurrentTechnicianSummary() {
        Users currentTechnician = authService.getCurrentAccount();

        if (currentTechnician.getRole() != UserRole.TECHNICIAN) {
            throw new InvalidDataException("Only technicians can access this resource");
        }

        List<MaintenanceChecklist> checklists = checklistRepo.findByTechnician_UserId(currentTechnician.getUserId());

        // Sử dụng hàm map Summary mới
        return checklists.stream()
                .map(this::mapChecklistToSummaryResponse)
                .collect(Collectors.toList());
    }


    /**
     * Lấy danh sách Checklist TÓM TẮT cho Customer đang đăng nhập.
     */
    @Autowired
    AuthenticationService authenticationService;

    public List<MaintenanceChecklistSummaryResponse> getChecklistByCustomerSummary() {
        Users currentUser = authenticationService.getCurrentAccount();
        List<MaintenanceChecklist> checklists = checklistRepo.findByBooking_Customer_UserId(currentUser.getUserId());

        // SỬ DỤNG HÀM MAP TÓM TẮT
        return checklists.stream().map(this::mapChecklistToSummaryResponse).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết Checklist theo Booking ID cho Customer (API Detail).
     */
    public MaintenanceChecklistResponse getChecklistByCustomerAndId(Integer bookingId) {
        Users currentUser = authenticationService.getCurrentAccount();

        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for booking ID: " + bookingId));

        // Kiểm tra quyền truy cập: Checklist này có thuộc về Customer đang đăng nhập không
        if (checklist.getBooking() == null || !checklist.getBooking().getCustomer().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You do not have permission to view this checklist.");
        }

        // SỬ DỤNG HÀM MAP ĐẦY ĐỦ
        return mapChecklistToResponseWithDetails(checklist);
    }

    // --- HÀM HELPER CHUNG ---

    /**
     * Hàm helper chung để map Checklist Entity sang Response DTO TÓM TẮT (Không có Details).
     */
    private MaintenanceChecklistSummaryResponse mapChecklistToSummaryResponse(MaintenanceChecklist checklist) {
        if (checklist == null) return null;

        // Map sang DTO TÓM TẮT
        MaintenanceChecklistSummaryResponse res = modelMapper.map(checklist, MaintenanceChecklistSummaryResponse.class);

        if (checklist.getBooking() != null) {
            Vehicle vehicle = checklist.getBooking().getVehicle();
            if (vehicle != null) {
                res.setVehicleNumberPlate(vehicle.getLicensePlate());
                res.setVehicleModel(vehicle.getModel());
                res.setCurrentKm(checklist.getActualKm() != null ? checklist.getActualKm() : vehicle.getCurrentKm());
            }
            res.setBookingStatus(checklist.getBooking().getStatus().name());
            res.setStatus(checklist.getStatus().name());
            if (checklist.getBooking().getCustomer() != null) {
                res.setCustomerName(checklist.getBooking().getCustomer().getFullName());
            }
        }

        if (checklist.getPlan() != null) {
            res.setPlanName(checklist.getPlan().getName());
            res.setMaintenanceKm(checklist.getPlan().getIntervalKm());
        }

        // Vẫn cần load details để tính toán tổng chi phí (dù không đưa details vào response DTO)
        List<MaintenanceChecklistDetailResponse> details = mapDetailsToResponse(checklist);
        BigDecimal totalApproved = BigDecimal.ZERO;
        BigDecimal totalDeclined = BigDecimal.ZERO;
        BigDecimal estimatedTotal = BigDecimal.ZERO;

        for (MaintenanceChecklistDetailResponse detail : details) {
            BigDecimal cost = Optional.ofNullable(detail.getLaborCost()).orElse(BigDecimal.ZERO)
                    .add(Optional.ofNullable(detail.getMaterialCost()).orElse(BigDecimal.ZERO));
            if (ApprovalStatus.APPROVED.name().equalsIgnoreCase(detail.getApprovalStatus())) {
                totalApproved = totalApproved.add(cost);
            } else if (ApprovalStatus.DECLINED.name().equalsIgnoreCase(detail.getApprovalStatus())) {
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
     * Hàm helper chung để map Checklist Entity sang Response DTO ĐẦY ĐỦ (có Details) và tính toán tổng chi phí.
     */
    public MaintenanceChecklistResponse mapChecklistToResponseWithDetails(MaintenanceChecklist checklist) {
        if (checklist == null) return null;

        MaintenanceChecklistResponse res = modelMapper.map(checklist, MaintenanceChecklistResponse.class);

        if (checklist.getBooking() != null && checklist.getBooking().getVehicle() != null) {
            Vehicle vehicle = checklist.getBooking().getVehicle();
            res.setVehicleNumberPlate(vehicle.getLicensePlate());
            res.setVehicleModel(vehicle.getModel());
            res.setCurrentKm(checklist.getActualKm() != null ? checklist.getActualKm() : vehicle.getCurrentKm());
        }
        res.setStatus(checklist.getStatus().name());
        if (checklist.getPlan() != null) {
            res.setPlanName(checklist.getPlan().getName());
            res.setMaintenanceKm(checklist.getPlan().getIntervalKm());
        }

        List<MaintenanceChecklistDetailResponse> details = mapDetailsToResponse(checklist);
        res.setDetails(details); // <-- Đưa chi tiết vào response

        BigDecimal totalApproved = BigDecimal.ZERO;
        BigDecimal totalDeclined = BigDecimal.ZERO;
        BigDecimal estimatedTotal = BigDecimal.ZERO;

        for (MaintenanceChecklistDetailResponse detail : details) {
            BigDecimal cost = Optional.ofNullable(detail.getLaborCost()).orElse(BigDecimal.ZERO)
                    .add(Optional.ofNullable(detail.getMaterialCost()).orElse(BigDecimal.ZERO));
            if (ApprovalStatus.APPROVED.name().equalsIgnoreCase(detail.getApprovalStatus())) {
                totalApproved = totalApproved.add(cost);
            } else if (ApprovalStatus.DECLINED.name().equalsIgnoreCase(detail.getApprovalStatus())) {
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
     * Technician bắt đầu quá trình bảo dưỡng (Start Maintenance) (LOGIC KM VÀ THÁNG)
     */
    public void startMaintenance(Integer bookingId, Integer actualKm) {
        if (checklistRepo.findByBooking_BookingId(bookingId).isPresent()) {
            MaintenanceChecklist existingChecklist = checklistRepo.findByBooking_BookingId(bookingId).get();
            existingChecklist.setStatus(ChecklistStatus.IN_PROGRESS);
            checklistRepo.save(existingChecklist);

            Booking booking = bookingRepo.findById(bookingId) // Lấy lại Booking và đổi trạng thái booking thành "In Progress"
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
            booking.setStatus(BookingStatus.IN_PROGRESS);
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

        // Lấy ngày mua xe
        LocalDate registrationDate = vehicle.getPurchaseDate();
        if (registrationDate == null) {
            throw new InvalidDataException("Vehicle must have a purchase date to determine the applicable maintenance plan.");
        }


        Integer monthsElapsed = calculateMonthsElapsed(registrationDate);


        MaintenancePlan applicablePlan = getApplicableMaintenancePlanWithTime(vehicle, monthsElapsed);

        if (applicablePlan == null) {
            throw new InvalidDataException("No applicable Maintenance Plan found for this vehicle based on actual mileage and time.");
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
        newChecklist.setStatus(ChecklistStatus.IN_PROGRESS);
        newChecklist.setStartTime(LocalDateTime.now()); // Ghi lại thời gian bắt đầu
        newChecklist.setMaintenanceNo(applicablePlan.getMaintenanceNo()); // Gán maintenanceNo từ plan

        booking.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepo.save(booking);

        final MaintenanceChecklist savedChecklist = checklistRepo.save(newChecklist);

        List<MaintenancePlanItem> items = planItemRepo.findByPlan_Id(applicablePlan.getId());
        List<MaintenanceChecklistDetail> details = items.stream()
                .map(item -> {
                    MaintenanceChecklistDetail detail = new MaintenanceChecklistDetail();
                    detail.setChecklist(savedChecklist);
                    detail.setPlanItem(item);
                    detail.setStatus(ChecklistDetailStatus.PENDING);
                    detail.setApprovalStatus(ApprovalStatus.PENDING);
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
                    if (detail.getStatus() != null) {
                        detailRes.setStatus(detail.getStatus().name());
                    }
                    if (detail.getApprovalStatus() != null) {
                        detailRes.setApprovalStatus(detail.getApprovalStatus().name());
                    } else {
                        detailRes.setApprovalStatus(ApprovalStatus.PENDING.name());
                    }

                    if (detail.getPlanItem() != null) {
                        detailRes.setItemName(detail.getPlanItem().getItemName());
                        detailRes.setActionType(detail.getPlanItem().getActionType());

                        Integer partTypeId = detail.getPlanItem().getPartType().getId();
                        if (partTypeId != null) {
                            List<Part> availableParts = partRepo.findByPartType_IdAndServiceCenter_Id(partTypeId, serviceCenterId);


                            List<PartOption> partOptions = availableParts.stream()
                                    .filter(part -> part.getQuantity() > 0)
                                    .map(part -> {

                                        PartOption option = new PartOption();
                                        option.setPartId(part.getId());
                                        option.setPartName(part.getName());
                                        option.setLaborCost(part.getLaborCost());
                                        option.setMaterialCost(part.getMaterialCost());
                                        option.setQuantity(part.getQuantity());
                                        return option;
                                    })
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
     * Phương thức tìm MaintenancePlan áp dụng (Kết hợp KM và Tháng)
     * Đây là hàm mới thay thế cho hàm cũ chỉ dùng KM.
     */
    public MaintenancePlan getApplicableMaintenancePlanWithTime(Vehicle vehicle, Integer monthsElapsed) {
        // 0. Lấy thông tin cần thiết
        MaintenanceSchedule schedule = vehicle.getSchedules().stream()
                .findFirst()
                .map(VehicleSchedule::getSchedule)
                .orElse(null);

        if (schedule == null) return null;
        List<MaintenancePlan> plans = planRepo.findBySchedule_Id(schedule.getId());
        if (plans.isEmpty()) return null;
        Integer currentKm = vehicle.getCurrentKm();
        MaintenancePlan planByKm = null;
        MaintenancePlan planByMonth = null;

        // 1. Tìm Gói phù hợp dựa trên KM (Mốc KM kế tiếp chưa tới)
        for (MaintenancePlan plan : plans) {
            if (currentKm < plan.getIntervalKm()) {
                planByKm = plan;
                break;
            }
        }
        // Nếu đã vượt qua tất cả mốc KM, chọn gói CUỐI CÙNG (mốc cao nhất)
        if (planByKm == null) {
            planByKm = plans.get(plans.size() - 1);
        }

        // 2. Tìm Gói phù hợp dựa trên Thời gian (Mốc Tháng kế tiếp chưa tới)
        for (MaintenancePlan plan : plans) {
            if (monthsElapsed < plan.getIntervalMonth()) {
                planByMonth = plan;
                break;
            }
        }
        // Nếu đã vượt qua tất cả mốc Tháng, chọn gói CUỐI CÙNG (mốc cao nhất)
        if (planByMonth == null) {
            planByMonth = plans.get(plans.size() - 1);
        }
        // 3. ÁP DỤNG LOGIC ƯU TIÊN: Chọn gói bảo dưỡng có mốc cao hơn (IntervalKm lớn hơn) trong 2 gói.

        // So sánh 2 gói: Chọn gói có mốc KM lớn hơn.
        if (planByKm.getIntervalKm() >= planByMonth.getIntervalKm()) {
            return planByKm;
        } else {
            return planByMonth;
        }
    }

    /**
     * Tính số tháng đã trôi qua kể từ ngày mua/đăng ký xe đến ngày hiện tại.
     *
     * @param registrationDate Ngày mua xe (purchaseDate).
     * @return Số tháng đã trôi qua (làm tròn xuống).
     */
    private int calculateMonthsElapsed(LocalDate registrationDate) {
        if (registrationDate == null) {
            log.error("Purchase date is missing for the vehicle.");
            // Trả về giá trị lớn để buộc chọn mốc bảo dưỡng cao nhất nếu ngày mua bị thiếu.
            return 999;
        }

        // Tính số tháng giữa ngày đăng ký và ngày hiện tại (LocalDate.now())
        return (int) ChronoUnit.MONTHS.between(registrationDate, LocalDate.now());
    }

    // ---

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, ChecklistDetailUpdateRequest request) {

        Users currentUser = authService.getCurrentAccount();
        Integer currentUserId = currentUser.getUserId();

        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));

        if (!detail.getChecklist().getTechnician().getUserId().equals(currentUserId)) {
            throw new InvalidDataException("You are not the assigned technician for this checklist.");
        }
        ChecklistDetailStatus newStatusEnum;
        try {
            newStatusEnum = ChecklistDetailStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status value from request: {}", request.status());
            throw new InvalidDataException("Invalid status value provided: " + request.status());
        }
        Integer partId = request.partId();
        detail.setStatus(newStatusEnum);
        detail.setNote(request.note());
        detail.setPart(null);
        detail.setLaborCost(BigDecimal.ZERO);
        detail.setMaterialCost(BigDecimal.ZERO);
        detail.setApprovalStatus(ApprovalStatus.PENDING);

        if (newStatusEnum == ChecklistDetailStatus.REPLACE && partId != null) {
            Part part = partRepo.findById(partId)
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));
            if (part.getQuantity() <= 0) {
                throw new InvalidDataException("Part is out of stock: " + part.getName());
            }
            detail.setPart(part);
            detail.setLaborCost(Optional.ofNullable(part.getLaborCost()).orElse(BigDecimal.ZERO));
            detail.setMaterialCost(Optional.ofNullable(part.getMaterialCost()).orElse(BigDecimal.ZERO));

        } else if (newStatusEnum == ChecklistDetailStatus.REPAIR) {
            BigDecimal laborCost = Optional.ofNullable(request.laborCost()).orElse(BigDecimal.ZERO);
            if (laborCost.compareTo(BigDecimal.ZERO) < 0) {
                throw new InvalidDataException("Labor cost must be greater than 0.");
            }
            BigDecimal materialCost = Optional.ofNullable(request.materialCost()).orElse(BigDecimal.ZERO);
            if (materialCost.compareTo(BigDecimal.ZERO) < 0) {
                throw new InvalidDataException("Material cost must be greater than 0.");
            }
            detail.setLaborCost(laborCost);
            detail.setMaterialCost(materialCost);


        } else if (newStatusEnum == ChecklistDetailStatus.ADJUSTMENT || newStatusEnum == ChecklistDetailStatus.GOOD || newStatusEnum == ChecklistDetailStatus.PENDING) {
            detail.setLaborCost(BigDecimal.ZERO);
            detail.setMaterialCost(BigDecimal.ZERO);
        }
        detailRepo.save(detail);
        log.info("Updated checklist detail successfully by user {}", currentUserId);
    }

    @Transactional
    public void updateCustomerApproval(Integer detailId, String approvalStatus, String customerNote) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));

        Integer checklistId = detail.getChecklist().getId();

        Object lock = checklistLocks.computeIfAbsent(checklistId, k -> new Object());
        synchronized (lock) {
            // Validation
            ApprovalStatus newApprovalStatus;
            try {
                newApprovalStatus = ApprovalStatus.valueOf(approvalStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.error("Invalid approval status value: {}", approvalStatus);
                throw new InvalidDataException("Invalid approval status. Must be APPROVED, DECLINED, or PENDING.");
            }

            // Kiểm tra nếu KTV chưa cập nhật status
            if (detail.getStatus() == ChecklistDetailStatus.PENDING &&
                    newApprovalStatus != ApprovalStatus.PENDING) {
                throw new InvalidDataException("Cannot approve/decline an item that has not been inspected by the technician.");
            }

            detail.setApprovalStatus(newApprovalStatus);
            detail.setCustomerNote(customerNote);
            detailRepo.save(detail);
            checkAndSetChecklistPendingApproval(checklistId);

            log.info("Updated approval for detail {} on checklist {}", detailId, checklistId);
        }

    }

    /**
     * Hoàn thành checklist (Complete Checklist)
     */
    @Transactional
    public void completeChecklist(Integer checklistId) {
        MaintenanceChecklist checklist = checklistRepo.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found."));

        if (checklist.getStatus() != ChecklistStatus.PENDING_APPROVAL) {
            throw new InvalidDataException("Checklist must be 'Pending Approval' by the customer to complete. Current status: " + checklist.getStatus());
        }

        List<MaintenanceChecklistDetail> detailsToProcess = detailRepo.findByChecklist_IdAndApprovalStatus(checklistId, ApprovalStatus.APPROVED);

        for (MaintenanceChecklistDetail detail : detailsToProcess) {
            if (detail.getStatus() == ChecklistDetailStatus.REPLACE && detail.getPart() != null) {
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

        checklist.setStatus(ChecklistStatus.COMPLETED);
        checklistRepo.save(checklist);
        Booking booking = checklist.getBooking();
        if (booking != null) {
            // Lấy maintenance_no từ checklist (đã được technician xác nhận)
            Integer actualMaintenanceNo = checklist.getMaintenanceNo();

            if (actualMaintenanceNo != null) {
                log.info("Updating booking {} maintenance_no from {} to {}",
                        booking.getBookingId(),
                        booking.getMaintenanceNo(),
                        actualMaintenanceNo);

                booking.setMaintenanceNo(actualMaintenanceNo);
                bookingRepo.save(booking);
            }

            // Cập nhật vehicle's currentKm nếu có actual_km
            Integer actualKm = checklist.getActualKm();
            if (actualKm != null && booking.getVehicle() != null) {
                Vehicle vehicle = booking.getVehicle();

                // Chỉ cập nhật nếu actualKm lớn hơn currentKm hiện tại
                if (vehicle.getCurrentKm() == null || actualKm > vehicle.getCurrentKm()) {
                    log.info("Updating vehicle {} currentKm from {} to {}",
                            vehicle.getLicensePlate(),
                            vehicle.getCurrentKm(),
                            actualKm);

                    vehicle.setCurrentKm(actualKm);
                    vehicleRepo.save(vehicle);
                }
            }
        }
    }
    // *** PHƯƠNG THỨC CHO STAFF ***

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

    /**
     * Lấy chi tiết Checklist theo Booking ID cho Technician đang đăng nhập.
     * * @param bookingId ID của Booking (cũng là ID dùng để tìm Checklist)
     *
     * @return MaintenanceChecklistResponse DTO
     * @throws ResourceNotFoundException Nếu không tìm thấy Checklist
     * @throws AccessDeniedException     Nếu Technician không được gán cho Checklist này
     */
    public MaintenanceChecklistResponse getChecklistByTechnicianAndBookingId(Integer bookingId) {
        // 1. Lấy thông tin Technician đang đăng nhập
        Users currentTechnician = authService.getCurrentAccount();

        if (currentTechnician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Only technicians can access this resource.");
        }

        //  Tìm Checklist dựa trên bookingId
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for booking ID: " + bookingId));

        // Kiểm tra quyền truy cập: Checklist có được gán cho Technician này không
        if (checklist.getTechnician() == null || !checklist.getTechnician().getUserId().equals(currentTechnician.getUserId())) {
            log.warn("Access denied for technician {} trying to access checklist for booking ID {}",
                    currentTechnician.getUserId(), bookingId);
            throw new AccessDeniedException("You are not the assigned technician for this checklist.");
        }
        return mapChecklistToResponseWithDetails(checklist);
    }
    private void checkAndSetChecklistPendingApproval(Integer checklistId) {
        MaintenanceChecklist checklist = checklistRepo.findById(checklistId).orElse(null);
        if (checklist == null || checklist.getStatus() != ChecklistStatus.IN_PROGRESS) {
            return; // Chỉ xử lý khi checklist đang IN_PROGRESS
        }
        List<MaintenanceChecklistDetail> details = detailRepo.findByChecklist_Id(checklistId);
        // Kiểm tra xem còn hạng mục nào đang chờ khách hàng duyệt (ApprovalStatus = PENDING) không
        boolean allApprovedOrDeclined = details.stream()
                .allMatch(d -> d.getApprovalStatus() == ApprovalStatus.APPROVED || d.getApprovalStatus() == ApprovalStatus.DECLINED);
        // Kiểm tra xem còn hạng mục nào KTV chưa xử lý (ChecklistDetailStatus = PENDING) không
        boolean allTechnicianProcessed = details.stream()
                .allMatch(d -> d.getStatus() != ChecklistDetailStatus.PENDING);
        // Nếu tất cả đã được KH duyệt/từ chối VÀ tất cả đã được KTV xử lý -> Chuyển Checklist sang PENDING_APPROVAL
        if (allApprovedOrDeclined && allTechnicianProcessed) {
            log.info("All details processed and approved/declined for checklist {}, setting status to PENDING_APPROVAL", checklistId);
            checklist.setStatus(ChecklistStatus.PENDING_APPROVAL);
            checklistRepo.save(checklist);
        } else {
            log.debug("Checklist {} not yet ready for PENDING_APPROVAL. All approved/declined: {}, All technician processed: {}",
                    checklistId, allApprovedOrDeclined, allTechnicianProcessed);
        }
    }
}
