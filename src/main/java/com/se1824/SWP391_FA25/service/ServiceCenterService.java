package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.enums.ApprovalStatus;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.model.request.ServiceCenterRequest;
import com.se1824.SWP391_FA25.model.response.PartAnalyticsResponse;
import com.se1824.SWP391_FA25.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceCenterService {

    private final ServiceCenterRepository serviceCenterRepository;
    private final PartRepository partRepository;
    private final PartTypeRepository partTypeRepository;
    private final MaintenanceChecklistDetailRepository checklistDetailRepo;

    /**
     * CREATE: Thêm một ServiceCenter mới
     */
    public ServiceCenter createServiceCenter(ServiceCenterRequest requestDTO) {

        String trimmedName = requestDTO.getName().trim();
        String trimmedPhone = requestDTO.getPhone().trim();

        if (serviceCenterRepository.findByName(trimmedName).isPresent()) {
            throw new InvalidDataException("Name already exist in system.");
        }
        if (serviceCenterRepository.findByPhone(trimmedPhone).isPresent()) {
            throw new InvalidDataException("Phone are signed for other center.");
        }

        ServiceCenter serviceCenter = new ServiceCenter();
        serviceCenter.setName(trimmedName);
        serviceCenter.setPhone(trimmedPhone);
        serviceCenter.setAddress(requestDTO.getAddress().trim());

        return serviceCenterRepository.save(serviceCenter);
    }

    /**
     * READ (One): Lấy thông tin ServiceCenter theo ID
     */
    public ServiceCenter getServiceCenterById(Integer centerId) {
        return serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new InvalidDataException("Can not found service center with ID: " + centerId));
    }

    /**
     * READ (All): Lấy tất cả các ServiceCenter
     */
    public List<ServiceCenter> getAllServiceCenters() {
        return serviceCenterRepository.findAll();
    }

    /**
     * UPDATE: Cập nhật thông tin ServiceCenter
     */
    public ServiceCenter updateServiceCenter(Integer centerId, ServiceCenterRequest requestDTO) {
        ServiceCenter existingCenter = getServiceCenterById(centerId);

        String trimmedName = requestDTO.getName().trim();
        String trimmedPhone = requestDTO.getPhone().trim();

        if (!trimmedName.equalsIgnoreCase(existingCenter.getName())) {
            if (serviceCenterRepository.findByName(trimmedName).isPresent()) {
                throw new InvalidDataException("Name already exist in system.");
            }
            existingCenter.setName(trimmedName);
        }

        if (!trimmedPhone.equals(existingCenter.getPhone())) {
            if (serviceCenterRepository.findByPhone(trimmedPhone).isPresent()) {
                throw new InvalidDataException("Phone are signed for other center.");
            }
            existingCenter.setPhone(trimmedPhone);
        }
        existingCenter.setAddress(requestDTO.getAddress().trim());

        return serviceCenterRepository.save(existingCenter);
    }

    /**
     * DELETE: Xóa một ServiceCenter
     */
    public void deleteServiceCenter(Integer centerId) {
        if (!serviceCenterRepository.existsById(centerId)) {
            throw new InvalidDataException("Can not found service center with ID: " + centerId + " để xóa.");
        }
        serviceCenterRepository.deleteById(centerId);
    }

    /**
     * CREATE: Thêm một Part mới (hoặc cập nhật nếu trùng tên)
     */
    public Part createPart(PartCreateRequest request, Integer centerId) {
        ServiceCenter center = serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCenter not exist ID: " + centerId));

        PartType partType = partTypeRepository.findById(request.getPartTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("PartType not exist ID: " + request.getPartTypeId()));
        String trimmedName = request.getName().trim();
        Optional<Part> existingPartOpt = partRepository.findByNameAndServiceCenter_Id(request.getName(), centerId);

        if (existingPartOpt.isPresent()) {
            // NẾU TỒN TẠI: Cập nhật part cũ
            Part existingPart = existingPartOpt.get();

            // 1. Cộng dồn số lượng
            int newQuantity = existingPart.getQuantity() + request.getQuantity();
            existingPart.setQuantity(newQuantity);

            // 2. Cập nhật giá và phí mới (theo yêu cầu của bạn)
            existingPart.setUnitPrice(request.getUnitPrice());
            existingPart.setLaborCost(request.getLaborCost());
            existingPart.setMaterialCost(request.getMaterialCost());
            existingPart.setPartType(partType); // Cập nhật cả loại

            return partRepository.save(existingPart);

        } else {
            Part newPart = new Part();
            newPart.setName(trimmedName);
            newPart.setQuantity(request.getQuantity());
            newPart.setUnitPrice(request.getUnitPrice());
            newPart.setLaborCost(request.getLaborCost());
            newPart.setMaterialCost(request.getMaterialCost());
            newPart.setServiceCenter(center);
            newPart.setPartType(partType);

            return partRepository.save(newPart);
        }
    }

    /**
     * READ (One): Lấy thông tin Part theo ID
     */
    public Part getPartById(Integer partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new InvalidDataException("Can not found Part with ID: " + partId));
    }

    /**
     * UPDATE: Cập nhật thông tin Part
     */
    public Part updatePart(Integer partId, PartCreateRequest dto) {

        // 1. Tìm Part có sẵn
        Part existingPart = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part are not exist ID: " + partId));

        // 2. Tìm PartType mới (nếu người dùng thay đổi)

        String trimmedName = dto.getName().trim();
        // 3. Map dữ liệu từ DTO sang Entity
        existingPart.setName(trimmedName);
        existingPart.setQuantity(dto.getQuantity());
        existingPart.setUnitPrice(dto.getUnitPrice());
        existingPart.setLaborCost(dto.getLaborCost());
        existingPart.setMaterialCost(dto.getMaterialCost());
        return partRepository.save(existingPart);
    }
    /**
     * UPDATE (Manager): Cập nhật thông tin Part (Chỉ Quantity)
     * Manager chỉ được cập nhật số lượng.
     */
    public Part updatePartQuantity(Integer partId, PartCreateRequest dto) {

        // 1. Tìm Part có sẵn
        Part existingPart = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part are not exist ID: " + partId));

        // 2. Chỉ cập nhật số lượng (quantity)
        existingPart.setQuantity(dto.getQuantity());

        // 3. Lưu lại thay đổi (chỉ lưu số lượng mới)
        return partRepository.save(existingPart);
    }

    /**
     * DELETE: Xóa một Part
     */
    public void deletePart(Integer partId) {
        if (!partRepository.existsById(partId)) {
            throw new InvalidDataException("Can not found part with ID: " + partId + " to delete.");
        }
        partRepository.deleteById(partId);
    }


    /**
     * Lấy danh sách Part của một ServiceCenter cụ thể
     */
    public List<Part> getPartsByServiceCenter(Integer centerId) {
        return partRepository.findByServiceCenterIdWithPartType(centerId);
    }

    /**
     * Lấy danh sách Part theo Loại và ServiceCenter
     */
    public List<Part> getPartsByTypeAndServiceCenter(Integer partTypeId, Integer centerId) {
        return partRepository.findByPartType_IdAndServiceCenter_Id(partTypeId, centerId);
    }


    /**
     * READ (All): Lấy tất cả PartType (Dùng cho dropdown của Front-end)
     */
    public List<PartType> getAllPartTypes() {
        return partTypeRepository.findAll();
    }

    /**
     * READ (One): Lấy PartType theo ID
     */
    public PartType getPartTypeById(Integer id) {
        return partTypeRepository.findById(id)
                .orElseThrow(() -> new InvalidDataException("Can not found PartType with ID: " + id));
    }

    /**
     * UPDATE: Cập nhật PartType (tên, mô tả)
     */
    public PartType updatePartType(Integer id, PartType partTypeDetails) {
        PartType existingType = getPartTypeById(id);
        existingType.setName(partTypeDetails.getName());
        existingType.setDescription(partTypeDetails.getDescription());
        return partTypeRepository.save(existingType);
    }

    /**
     * Lấy dữ liệu thống kê linh kiện cho Chart 3 (bắt buộc theo center)
     */
    public PartAnalyticsResponse getPartAnalytics(Integer centerId, Integer month, Integer year) {
        log.info("Fetching part analytics for center: {}, month: {}, year: {}",
                (centerId != null ? centerId : "ALL"), month, year);

        List<Object[]> results;

        if (centerId != null) {
            // Logic cho 1 center (Manager, Staff, hoặc Admin xem 1 center)
            results = checklistDetailRepo.findPartUsageStatsByCenterAndMonthAndYear(
                    centerId, month, year, ApprovalStatus.APPROVED
            );
        } else {
            // Logic cho Admin xem TẤT CẢ center
            results = checklistDetailRepo.findAllPartUsageStatsByMonthAndYear(
                    month, year, ApprovalStatus.APPROVED
            );
        }

        List<String> labels = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (Object[] result : results) {
            labels.add((String) result[0]); // Tên linh kiện
            counts.add((Long) result[1]); // Số lượng
        }

        if (labels.isEmpty()) {
            log.warn("No part stats data found");
        }

        return new PartAnalyticsResponse(labels, counts);
    }

}