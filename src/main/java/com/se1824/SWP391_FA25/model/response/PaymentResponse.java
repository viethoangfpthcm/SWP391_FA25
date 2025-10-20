package com.se1824.SWP391_FA25.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    Integer paymentId;
    Integer bookingId;
    String customerName;
    String serviceCenterName;
    LocalDateTime paymentDate;
    String paymentMethod;
    String status;
    String note;
    String vehicleModel;
    String vehicleLicensePlate;
    List<MaintenanceChecklistDetailResponse> checklistDetails;
    BigDecimal laborCost;
    BigDecimal materialCost;
    BigDecimal totalAmount;

}
