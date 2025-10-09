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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Transactional
@Slf4j
public class MaintenanceChecklistService {
   final MaintenanceChecklistRepository checklistRepo;
   final MaintenanceChecklistDetailRepository detailRepo;
   final BookingRepository bookingRepo;
   final MaintenancePlanItemRepository planItemRepo;
   final MaintenancePlanRepository planRepo;
   final PartRepository partRepo;
   final ModelMapper modelMapper;


    public List<MaintenanceChecklistResponse> getChecklistByTechnicianWithVehicle(String technicianId) {
        List<MaintenanceChecklist> checklists = checklistRepo.findByTechnician_UserId(technicianId);

        return checklists.stream().map(checklist -> {
            MaintenanceChecklistResponse res = modelMapper.map(checklist, MaintenanceChecklistResponse.class);

            // Lấy thông tin xe
            if (checklist.getBooking() != null && checklist.getBooking().getVehicle() != null) {
                var vehicle = checklist.getBooking().getVehicle();
                res.setVehicleNumberPlate(vehicle.getLicensePlate());
                res.setVehicleModel(vehicle.getModel());
                res.setCurrentKm(vehicle.getCurrentKm());
            }

            // Ví dụ lấy km bảo dưỡng (có thể dựa trên thông tin trong MaintenancePlan hay thuộc tính nào đó)
            if (checklist.getMaintenancePlan() != null) {
                res.setMaintenanceKm(extractIntervalKm(checklist.getMaintenancePlan().getName()));
            }

            // Có thể lấy thêm chi tiết tương tự như getChecklistByCustomer

            return res;
        }).collect(Collectors.toList());
    }


    public List<MaintenanceChecklistResponse> getChecklistByCustomer(String customerId) {
        List<MaintenanceChecklist> checklists = checklistRepo.findByBooking_Customer_UserId(customerId);

        return checklists.stream().map(checklist -> {
            MaintenanceChecklistResponse res = modelMapper.map(checklist, MaintenanceChecklistResponse.class);

            // Lấy thông tin xe
            if (checklist.getBooking() != null && checklist.getBooking().getVehicle() != null) {
                var vehicle = checklist.getBooking().getVehicle();
                res.setVehicleNumberPlate(vehicle.getLicensePlate());
                res.setVehicleModel(vehicle.getModel());
                res.setCurrentKm(vehicle.getCurrentKm());
            }

            List<MaintenanceChecklistDetailResponse> details = detailRepo.findByChecklist_Id(checklist.getId())
                    .stream()
                    .map(detail -> {

                        MaintenanceChecklistDetailResponse detailRes =
                                modelMapper.map(detail, MaintenanceChecklistDetailResponse.class);

                        if (detail.getPlanItem() != null) {
                            detailRes.setItemName(detail.getPlanItem().getItemName());
                        }

                        if (detail.getPart() != null) {
                            detailRes.setPartName(detail.getPart().getName());
                        } else {
                            detailRes.setPartName(null);
                        }
                        if (detail.getPart() != null) {
                            detailRes.setPartName(detail.getPart().getName());

                            // Lấy giá từ Part
                            detailRes.setLaborCost(detail.getPart().getLaborCost());
                            detailRes.setMaterialCost(detail.getPart().getMaterialCost());
                        } else {
                            detailRes.setPartName(null);
                            detailRes.setLaborCost(null);
                            detailRes.setMaterialCost(null);
                        }

                        return detailRes;
                    })
                    .collect(Collectors.toList());

            res.setDetails(details);
            BigDecimal totalApproved = BigDecimal.ZERO;
            BigDecimal totalDeclined = BigDecimal.ZERO;
            BigDecimal estimatedTotal = BigDecimal.ZERO;

            for (MaintenanceChecklistDetailResponse Detail : details) {

                // approvalStatus (APPROVED/DECLINED/PENDING)
                // laborCost, materialCost

                BigDecimal laborCost = Optional.ofNullable(Detail.getLaborCost()).orElse(BigDecimal.ZERO);
                BigDecimal materialCost = Optional.ofNullable(Detail.getMaterialCost()).orElse(BigDecimal.ZERO);
                BigDecimal cost = laborCost.add(materialCost);

                if ("APPROVED".equalsIgnoreCase(Detail.getApprovalStatus())) {
                    totalApproved = totalApproved.add(cost);
                } else if ("DECLINED".equalsIgnoreCase(Detail.getApprovalStatus())) {
                    totalDeclined = totalDeclined.add(cost);
                }
                // Với chi phí dự kiến, có thể cộng tất cả chi phí hoặc logic riêng
                estimatedTotal = estimatedTotal.add(cost);
            }

            res.setTotalCostApproved(totalApproved);
            res.setTotalCostDeclined(totalDeclined);
            res.setEstimatedCost(estimatedTotal);

            return res;
        }).collect(Collectors.toList());
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
            log.error("Error parsing interval km from: {}", planName, e);
        }
        return null;
    }

    // ---

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, String status, String note, Integer partId ,String currentCustomerId) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));
        String ownerCustomerId = detail.getChecklist().getBooking().getCustomer().getUserId();
        if (!ownerCustomerId.equals(currentCustomerId)) {
            throw new InvalidDataException("You are not authorized to update this checklist detail");
        }
        detail.setStatus(status);
        detail.setNote(note);
        Integer vehicleScheduleId = detail.getChecklist().getBooking().getVehicle().getMaintenanceSchedule().getId();
        if (partId != null) {
            Part part = partRepo.findById(partId)
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));


            if (!part.getSchedule().getId().equals(vehicleScheduleId)) {
                throw new InvalidDataException("Part không phù hợp với mẫu xe");
            }


            if (part.getQuantity() <= 0) {
                throw new InvalidDataException("Part hết hàng: " + part.getName());
            }

            detail.setPart(part);


            part.setQuantity(part.getQuantity() - 1);
            partRepo.save(part);
        } else {
            detail.setPart(null);
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
}