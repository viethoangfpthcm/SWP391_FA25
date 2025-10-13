package com.se1824.SWP391_FA25.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PartOption {
    Integer partId;
    String partName;
    BigDecimal laborCost;
    BigDecimal materialCost;
    Integer quantity;
}