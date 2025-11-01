package com.se1824.SWP391_FA25.model.request;

import com.se1824.SWP391_FA25.enums.ActionType;
import lombok.Data;

@Data
public class MaintenancePlanItemRequest {
    Integer planId;
    String item_name;
    ActionType actionType;
    Integer part_type_id;
    String note;
}
