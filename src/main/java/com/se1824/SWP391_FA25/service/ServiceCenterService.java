package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.*;
import com.se1824.SWP391_FA25.exception.exceptions.InvalidDataException;
import com.se1824.SWP391_FA25.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceCenterService {
    @Autowired
    private ServiceCenterRepository serviceCenterRepository;
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private PartTypeRepository partTypeRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    /**
     * CREATE: Thêm một ServiceCenter mới
     */
    public ServiceCenter createServiceCenter(ServiceCenter serviceCenter) {
        return serviceCenterRepository.save(serviceCenter);
    }

    /**
     * READ (One): Lấy thông tin ServiceCenter theo ID
     */
    public ServiceCenter getServiceCenterById(Integer centerId) {
        return serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new InvalidDataException("Không tìm thấy ServiceCenter với ID: " + centerId));
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
    public ServiceCenter updateServiceCenter(Integer centerId, ServiceCenter centerDetails) {
        ServiceCenter existingCenter = getServiceCenterById(centerId);

        existingCenter.setName(centerDetails.getName());
        existingCenter.setAddress(centerDetails.getAddress());
        existingCenter.setPhone(centerDetails.getPhone());

        return serviceCenterRepository.save(existingCenter);
    }

    /**
     * DELETE: Xóa một ServiceCenter
     */
    public void deleteServiceCenter(Integer centerId) {
        if (!serviceCenterRepository.existsById(centerId)) {
            throw new InvalidDataException("Không tìm thấy ServiceCenter với ID: " + centerId + " để xóa.");
        }
        serviceCenterRepository.deleteById(centerId);
    }

    /**
     * CREATE: Thêm một Part mới
     */
    public Part createPart(Part part) {
         if(!serviceCenterRepository.existsById(part.getServiceCenter().getId())) {
            throw new InvalidDataException("ServiceCenter không tồn tại");
         }
        return partRepository.save(part);
    }

    /**
     * READ (One): Lấy thông tin Part theo ID
     */
    public Part getPartById(Integer partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new InvalidDataException("Không tìm thấy Part với ID: " + partId));
    }

    /**
     * UPDATE: Cập nhật thông tin Part
     */
    public Part updatePart(Integer partId, Part partDetails) {
        Part existingPart = getPartById(partId);

        existingPart.setName(partDetails.getName());
        existingPart.setQuantity(partDetails.getQuantity());
        existingPart.setUnitPrice(partDetails.getUnitPrice());
        existingPart.setLaborCost(partDetails.getLaborCost());
        existingPart.setMaterialCost(partDetails.getMaterialCost());

        return partRepository.save(existingPart);
    }

    /**
     * DELETE: Xóa một Part
     */
    public void deletePart(Integer partId) {
        if (!partRepository.existsById(partId)) {
            throw new InvalidDataException("Không tìm thấy Part với ID: " + partId + " để xóa.");
        }
        partRepository.deleteById(partId);
    }




    /**
     * Lấy danh sách Part của một ServiceCenter cụ thể
     */
    public List<Part> getPartsByServiceCenter(Integer centerId) {
        return partRepository.findByServiceCenter_Id(centerId);
    }

    /**
     * Lấy danh sách Part theo Loại và ServiceCenter
     */
    public List<Part> getPartsByTypeAndServiceCenter(Integer partTypeId, Integer centerId) {
        return partRepository.findByPartType_IdAndServiceCenter_Id(partTypeId, centerId);
    }

    /**
     * Lấy danh sách Booking của một ServiceCenter cụ thể
     */
    public List<Booking> getBookingsByServiceCenter(Integer centerId) {
        return bookingRepository.findByServiceCenter_Id(centerId);
    }

    /**
     * Lấy danh sách Booking của ServiceCenter theo một trạng thái cụ thể
     */
    public List<Booking> getBookingsByServiceCenterAndStatus(Integer centerId, String status) {
        return bookingRepository.findByServiceCenter_IdAndStatus(centerId, status);
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
                .orElseThrow(() -> new InvalidDataException("Không tìm thấy PartType với ID: " + id));
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
     * READ : Lấy thông tin Payment theo ID
     *
     */
    public Payment getPaymentById(Integer paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new InvalidDataException("Không tìm thấy Payment với ID: " + paymentId));
    }
    /**
     * READ (List by ServiceCenter): Lấy danh sách Payment theo ServiceCenter
     */
    public List<Payment> getPaymentsByServiceCenter(Integer centerId) {
        if (!serviceCenterRepository.existsById(centerId)) {
            throw new InvalidDataException("Không tìm thấy ServiceCenter với ID: " + centerId);
        }
        return paymentRepository.findByBooking_ServiceCenter_Id(centerId);
    }
    /**
     * READ (One by Booking): Lấy thông tin Payment theo Booking ID
     *
     */
    public Payment getPaymentByBookingId(Integer bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new InvalidDataException("Không tìm thấy Booking với ID: " + bookingId);
        }

        return paymentRepository.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new InvalidDataException("Không tìm thấy Payment nào cho Booking ID: " + bookingId));
    }

}