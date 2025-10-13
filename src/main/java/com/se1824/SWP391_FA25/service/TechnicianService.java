package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Booking;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.response.AssignedBookingTechnicianResponse;
import com.se1824.SWP391_FA25.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechnicianService {

    private final BookingRepository bookingRepo;

    public TechnicianService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    /**
     * Lấy danh sách các booking đã được gán cho kỹ thuật viên hiện tại
     */
    public List<AssignedBookingTechnicianResponse> getAssignedBookings() {
        Users currentTechnician = new AuthenticationService().getCurrentAccount();

        List<Booking> assignedBookings = bookingRepo.findByAssignedTechnician_UserId(currentTechnician.getUserId());


        return assignedBookings.stream()
                .map(booking -> new AssignedBookingTechnicianResponse(
                        booking.getBookingId(),


                        booking.getCustomer() != null ? booking.getCustomer().getUserId() : "NULL",

                        booking.getVehicle().getLicensePlate(),

                        booking.getServiceCenter().getId(),
                        booking.getBookingDate(),
                        booking.getStatus(),


                        booking.getAssignedTechnician().getUserId(),
                        booking.getNote() // note
                ))
                .collect(Collectors.toList());
    }

}