package com.se1824.SWP391_FA25.model.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PartCreateRequest {
    @NotBlank(message = "Name can not be null")
    @Size(max = 255, message = "Name can not exceed 255 characters")
    String name;

    @NotNull(message = "Quantity can not be null")
    @Min(value = 0, message = "At less than 0")
    Integer quantity;

    @NotNull(message = "Unit price can not be null")
    @DecimalMin(value = "0.0", message = "Unit price can not less than 0")
    BigDecimal unitPrice;

    @NotNull(message = "labor cost can not be null")
    @DecimalMin(value = "0.0", message = "labor cost can not less than 0")
    BigDecimal laborCost;

    @NotNull(message = "Can not be null")
    @DecimalMin(value = "0.0", message = "Can not less than 0")
    BigDecimal materialCost;

    @NotNull(message = "can not be null")
    Integer partTypeId;
}
