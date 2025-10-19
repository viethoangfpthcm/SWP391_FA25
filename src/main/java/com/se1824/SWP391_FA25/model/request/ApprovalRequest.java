package com.se1824.SWP391_FA25.model.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApprovalRequest {
     String approvalStatus;
    String customerNote;



}
