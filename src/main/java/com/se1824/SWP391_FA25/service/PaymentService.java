package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Payment;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistDetailResponse;
import com.se1824.SWP391_FA25.model.response.MaintenanceChecklistResponse;
import com.se1824.SWP391_FA25.model.response.PaymentResponse;
import com.se1824.SWP391_FA25.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    PaymentRepository paymentRepository;
    @Autowired
    BookingService bookingService;
    @Autowired
    MaintenanceChecklistService maintenanceChecklistService;
    @Autowired
    AuthenticationService authenticationService;

    public PaymentResponse savePayment(Payment payment, Integer bookingId) {
        payment.setBooking(bookingService.getBookingById(bookingId));
        Users currentUser = authenticationService.getCurrentAccount();
        MaintenanceChecklistResponse checklistDetails = maintenanceChecklistService.getChecklistByCustomerAndId(bookingId);
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal laborCost = BigDecimal.ZERO;
        BigDecimal materialCost = BigDecimal.ZERO;
        for (MaintenanceChecklistDetailResponse checklistDetail : checklistDetails.getDetails()) {
            laborCost = laborCost.add(checklistDetail.getLaborCost());
            materialCost = materialCost.add(checklistDetail.getMaterialCost());
        }
        totalAmount = totalAmount.add(materialCost).add(laborCost);
        payment.setTotalAmount(totalAmount);
        payment.setLaborCost(laborCost);
        payment.setMaterialCost(materialCost);
        paymentRepository.save(payment);
        return null;
    }

}
