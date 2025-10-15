package com.se1824.SWP391_FA25.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    private Integer paymentId;
    private Integer bookingId;
    private String customerName;
    private String serviceCenterName;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String status;
    private String note;
    private String vehicleModel;
    private String vehicleLicensePlate;
    private List<MaintenanceChecklistDetailResponse> checklistDetails;
    private BigDecimal laborCost;
    private BigDecimal materialCost;
    private BigDecimal totalAmount;

}
