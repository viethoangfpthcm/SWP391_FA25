package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.response.AssignedBookingTechnicianResponse;
import com.se1824.SWP391_FA25.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TechnicianService {

    BookingRepository bookingRepo;
    AuthenticationService authenticationService;

    /**
     * Lấy danh sách các booking đã được gán cho kỹ thuật viên hiện tại
     */
    public List<AssignedBookingTechnicianResponse> getAssignedBookings() {

        Users currentTechnician = authenticationService.getCurrentAccount();

        // Lấy danh sách các booking được gán cho kỹ thuật viên này
        List<Booking> assignedBookings = bookingRepo.findByAssignedTechnician_UserId(currentTechnician.getUserId());

        // Sử dụng hàm helper để map sang DTO một cách chính xác
        return assignedBookings.stream()
                .map(this::mapToAssignedBookingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Hàm helper để chuyển đổi từ Booking entity sang DTO response.
     *
     * @param booking Booking entity
     * @return AssignedBookingTechnicianResponse DTO
     */
    private AssignedBookingTechnicianResponse mapToAssignedBookingResponse(Booking booking) {
        AssignedBookingTechnicianResponse dto = new AssignedBookingTechnicianResponse();
        dto.setBookingId(booking.getBookingId());

        // Lấy tên khách hàng thay vì ID
        if (booking.getCustomer() != null) {
            dto.setCustomerName(booking.getCustomer().getFullName());
        }

        // Lấy thông tin xe
        if (booking.getVehicle() != null) {
            dto.setVehiclePlate(booking.getVehicle().getLicensePlate());
            dto.setVehicleModel(booking.getVehicle().getModel());
        }

        dto.setBookingDate(booking.getBookingDate());
        dto.setStatus(booking.getStatus().name());
        dto.setNote(booking.getNote());
        if (booking.getMaintenancePlan() != null) {
            dto.setMaintenancePlanName(booking.getMaintenancePlan().getName());
        }

        return dto;
    }

}