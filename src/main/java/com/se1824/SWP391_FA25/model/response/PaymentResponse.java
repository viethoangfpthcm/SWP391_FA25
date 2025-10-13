package com.se1824.SWP391_FA25.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    Integer bookingId;
    String customerName;
    String serviceCenterName;
    String technicianName;
    LocalDateTime paymentDate;
    String status;
    String note;
    String vehicleModel;
    String vehicleLicensePlate;
    List<MaintenanceChecklistDetailResponse> checklistDetail;
    BigDecimal totalAmount;

}
