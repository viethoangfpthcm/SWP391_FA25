package com.se1824.SWP391_FA25.model.request;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PartCreateRequest {
    String name;
    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal laborCost;
    BigDecimal materialCost;
    Integer partTypeId;
}
