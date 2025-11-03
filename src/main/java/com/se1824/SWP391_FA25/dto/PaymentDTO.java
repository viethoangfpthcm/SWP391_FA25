package com.se1824.SWP391_FA25.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentDTO {
    Integer paymentId;
    Integer bookingId;
    LocalDateTime paymentDate;
    BigDecimal laborCost;
    BigDecimal materialCost;
    BigDecimal totalAmount;
    String paymentMethod;
    String status;
    String note;
    Integer centerId;
    String centerName;
    String customerName;
}
