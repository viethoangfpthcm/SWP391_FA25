package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.dto.PartOption;
import com.se1824.SWP391_FA25.entity.*;
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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    AuthenticationService authService;
    String STATUS_ADJUSTMENT = "HIỆU CHỈNH";
    String STATUS_REPAIR = "SỬA CHỮA";
    String STATUS_REPLACE = "THAY THẾ";
    String STATUS_GOOD = "TỐT";


    /**
     * Trả về chi phí nhân công cố định cho các hạng mục không dùng Part.
     */
    private BigDecimal getStandardLaborCost(String status) {
        if (STATUS_ADJUSTMENT.equalsIgnoreCase(status)) {
            // Chi phí cố định cho hiệu chỉnh (2.000.000 VND)
            return new BigDecimal("2000000");
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

        // Validate technician role
        if (!currentTechnician.getUserId().startsWith("TE")) {
            throw new InvalidDataException("Only technicians can access this resource");
        }

        List<MaintenanceChecklist> checklists = checklistRepo.findByTechnician_UserId(currentTechnician.getUserId());

        // Sử dụng hàm helper chung để lấy thông tin và tính toán chi phí
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
        MaintenanceChecklistResponse res = modelMapper.map(checklist, MaintenanceChecklistResponse.class);

        // Lấy thông tin xe
        if (checklist.getBooking() != null && checklist.getBooking().getVehicle() != null) {
            var vehicle = checklist.getBooking().getVehicle();
            res.setVehicleNumberPlate(vehicle.getLicensePlate());
            res.setVehicleModel(vehicle.getModel());
            res.setCurrentKm(vehicle.getCurrentKm());
        }

        // Lấy km bảo dưỡng
        if (checklist.getMaintenancePlan() != null) {
            res.setMaintenanceKm(extractIntervalKm(checklist.getMaintenancePlan().getName()));
        }

        List<MaintenanceChecklistDetailResponse> details = mapDetailsToResponse(checklist.getId());
        res.setDetails(details);

        // TÍNH TỔNG CHI PHÍ DỰA TRÊN DỮ LIỆU ĐÃ LƯU TRONG DETAIL
        BigDecimal totalApproved = BigDecimal.ZERO;
        BigDecimal totalDeclined = BigDecimal.ZERO;
        BigDecimal estimatedTotal = BigDecimal.ZERO;

        for (MaintenanceChecklistDetailResponse Detail : details) {

            BigDecimal laborCost = Optional.ofNullable(Detail.getLaborCost()).orElse(BigDecimal.ZERO);
            BigDecimal materialCost = Optional.ofNullable(Detail.getMaterialCost()).orElse(BigDecimal.ZERO);
            BigDecimal cost = laborCost.add(materialCost);

            if ("APPROVED".equalsIgnoreCase(Detail.getApprovalStatus())) {
                totalApproved = totalApproved.add(cost);
            } else if ("DECLINED".equalsIgnoreCase(Detail.getApprovalStatus())) {
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
     * Hàm helper để map chi tiết checklist ra response
     */
    private List<MaintenanceChecklistDetailResponse> mapDetailsToResponse(Integer checklistId) {
        MaintenanceChecklist checklist = checklistRepo.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found"));

        Integer vehicleScheduleId = checklist.getBooking().getVehicle().getMaintenanceSchedule().getId();
        Integer serviceCenterId = checklist.getBooking().getServiceCenter().getId();

        return detailRepo.findByChecklist_Id(checklistId)
                .stream()
                .map(detail -> {
                    MaintenanceChecklistDetailResponse detailRes = new MaintenanceChecklistDetailResponse();

                    detailRes.setId(detail.getId());
                    detailRes.setStatus(detail.getStatus());
                    detailRes.setApprovalStatus(detail.getApprovalStatus());
                    detailRes.setNote(detail.getNote());
                    detailRes.setCustomerNote(detail.getCustomerNote());

                    // Set plan item info
                    if (detail.getPlanItem() != null) {
                        detailRes.setPlanItemId(detail.getPlanItem().getId());
                        detailRes.setItemName(detail.getPlanItem().getItemName());
                        detailRes.setActionType(detail.getPlanItem().getActionType());


                        // Lấy partTypeId từ itemName
                        Integer partTypeId = getPartTypeIdByItemName(detail.getPlanItem().getItemName());

                        if (partTypeId != null) {
                            // parts theo: schedule + partType + serviceCenter
                            List<Part> availableParts = partRepo.findBySchedule_IdAndPartType_IdAndServiceCenter_Id(
                                    vehicleScheduleId,
                                    partTypeId,
                                    serviceCenterId
                            );

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
                        }


                    }

                    if (detail.getPart() != null) {
                        detailRes.setPartId(detail.getPart().getId());
                        detailRes.setPartName(detail.getPart().getName());
                    }

                    // Set costs
                    detailRes.setLaborCost(
                            detail.getLaborCost() != null ? detail.getLaborCost() : BigDecimal.ZERO
                    );
                    detailRes.setMaterialCost(
                            detail.getMaterialCost() != null ? detail.getMaterialCost() : BigDecimal.ZERO
                    );

                    return detailRes;
                })
                .collect(Collectors.toList());
    }

    /**
     * Technician bắt đầu quá trình bảo dưỡng (Start Maintenance)
     * => cập nhật trạng thái checklist sang "In Progress" và tạo chi tiết.
     */
    public void startMaintenance(Integer bookingId) {

        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElse(null);

        if (checklist == null) {
            var booking = bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));


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


            List<MaintenancePlanItem> items = planItemRepo.findByPlan_Id(plan.getId());

            List<MaintenanceChecklistDetail> details = items.stream()
                    .map(item -> {
                        MaintenanceChecklistDetail detail = new MaintenanceChecklistDetail();
                        detail.setChecklist(savedChecklist);
                        detail.setPlanItem(item);
                        detail.setStatus("Pending");
                        // Chi phí được mặc định là ZERO khi tạo
                        detail.setLaborCost(BigDecimal.ZERO);
                        detail.setMaterialCost(BigDecimal.ZERO);
                        return detail;
                    })
                    .toList();
            detailRepo.saveAll(details);

        } else {
            checklist.setStatus("In Progress");
            checklistRepo.save(checklist);
        }
    }


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
            log.error("Error parsing interval km from: {}", planName, e);
        }
        return null;
    }

    // ---

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, String status, String note, Integer partId, String currentUserId) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));


        String assignedTechnicianId = detail.getChecklist().getTechnician().getUserId();
        if (!assignedTechnicianId.equals(currentUserId)) {
            throw new InvalidDataException("You are not the assigned technician for this checklist.");
        }

        detail.setStatus(status);
        detail.setNote(note);
        String normalizedStatus = status.toUpperCase();

        // 1. Reset chi phí và Part
        detail.setPart(null);
        detail.setLaborCost(BigDecimal.ZERO);
        detail.setMaterialCost(BigDecimal.ZERO);

        Integer vehicleScheduleId = detail.getChecklist().getBooking().getVehicle().getMaintenanceSchedule().getId();

        // 2. Cập nhật chi phí dựa trên trạng thái
        if (STATUS_REPLACE.equalsIgnoreCase(normalizedStatus) && partId != null) {

            Part part = partRepo.findById(partId)
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

            if (!part.getSchedule().getId().equals(vehicleScheduleId)) {
                throw new InvalidDataException("Part không phù hợp với mẫu xe");
            }
            if (part.getQuantity() <= 0) {
                throw new InvalidDataException("Part hết hàng: " + part.getName());
            }

            detail.setPart(part);
            // LƯU CHI PHÍ TỪ PART VÀO DETAIL
            BigDecimal laborCost = Optional.ofNullable(part.getLaborCost()).orElse(BigDecimal.ZERO);
            BigDecimal materialCost = Optional.ofNullable(part.getMaterialCost()).orElse(BigDecimal.ZERO);
            detail.setLaborCost(Optional.ofNullable(part.getLaborCost()).orElse(BigDecimal.ZERO));
            detail.setMaterialCost(Optional.ofNullable(part.getMaterialCost()).orElse(BigDecimal.ZERO));

//            // Giảm quantity và lưu Part
//            part.setQuantity(part.getQuantity() - 1);
//            partRepo.save(part);

        } else if (STATUS_ADJUSTMENT.equalsIgnoreCase(normalizedStatus) || STATUS_REPAIR.equalsIgnoreCase(normalizedStatus)) {

            detail.setLaborCost(getStandardLaborCost(status));
            detail.setMaterialCost(BigDecimal.ZERO);

        }
        // Trạng thái 'Tốt'  cost = 0

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
     * Map item name sang part type ID
     */
    private Integer getPartTypeIdByItemName(String itemName) {
        if (itemName == null) return null;

        String normalizedName = itemName.toLowerCase().trim();

        // Mapping theo tên item trong database
        if (normalizedName.contains("lọc gió điều hòa")) {
            return 1; // part_type_id = 1
        } else if (normalizedName.contains("dầu phanh")) {
            return 2; // part_type_id = 2
        } else if (normalizedName.contains("hệ thống điều hòa") ||
                normalizedName.contains("bảo dưỡng hệ thống điều hòa")) {
            return 3; // part_type_id = 3
        } else if (normalizedName.contains("pin chìa khóa")) {
            return 4; // part_type_id = 4
        } else if (normalizedName.contains("pin t-box") ||
                normalizedName.contains("pin bộ t-box")) {
            return 5; // part_type_id = 5
        } else if (normalizedName.contains("nước làm mát")) {
            return 6; // part_type_id = 6
        }

        return null; // Không tìm thấy part type phù hợp
    }
    @Transactional
    public void completeChecklist(Integer checklistId) {
        MaintenanceChecklist checklist = checklistRepo.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found."));

        if (!"In Progress".equalsIgnoreCase(checklist.getStatus())) {
            throw new InvalidDataException("Checklist must be 'In Progress' to complete.");
        }

        // Lấy tất cả chi tiết đã được khách hàng phê duyệt
        List<MaintenanceChecklistDetail> detailsToProcess = detailRepo
                .findByChecklist_IdAndApprovalStatus(checklistId, "APPROVED");

        for (MaintenanceChecklistDetail detail : detailsToProcess) {
            // CHỈ TRỪ PART nếu là hạng mục "THAY THẾ" và đã có Part được gán
            if (STATUS_REPLACE.equalsIgnoreCase(detail.getStatus()) && detail.getPart() != null) {
                Part part = detail.getPart();

                // Kiểm tra tồn kho lần cuối
                if (part.getQuantity() <= 0) {
                    log.error("Part out of stock during checklist completion: {}", part.getName());
                    throw new InvalidDataException("Part " + part.getName() + " is currently out of stock. Cannot complete task.");
                }
                part.setQuantity(part.getQuantity() - 1);
                partRepo.save(part);

            }
        }


        checklist.setStatus("Completed");
        checklistRepo.save(checklist);


    }
}