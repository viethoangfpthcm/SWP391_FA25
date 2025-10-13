package com.se1824.SWP391_FA25.service;

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
     * Lấy Checklist cho Technician
     */
    public List<MaintenanceChecklistResponse> getChecklistByTechnicianWithVehicle(String technicianId) {
        List<MaintenanceChecklist> checklists = checklistRepo.findByTechnician_UserId(technicianId);
        // Sử dụng hàm helper chung để lấy thông tin và tính toán chi phí
        return checklists.stream().map(this::mapChecklistToResponseWithDetails).collect(Collectors.toList());
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
        return detailRepo.findByChecklist_Id(checklistId)
                .stream()
                .map(detail -> {
                    MaintenanceChecklistDetailResponse detailRes =
                            modelMapper.map(detail, MaintenanceChecklistDetailResponse.class);

                    if (detail.getPlanItem() != null) {
                        detailRes.setItemName(detail.getPlanItem().getItemName());
                    }

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

            // Giảm quantity và lưu Part
            part.setQuantity(part.getQuantity() - 1);
            partRepo.save(part);

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
}