package com.se1824.SWP391_FA25.model.request;

import java.math.BigDecimal;

public record ChecklistDetailUpdateRequest(String status,
                                           String note,
                                           Integer partId,
                                           BigDecimal laborCost,
                                           BigDecimal materialCost
                                           ) { }
