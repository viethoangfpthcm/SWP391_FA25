package com.se1824.SWP391_FA25.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor


public class MaintenanceChecklistResponse {
    Integer id;
    String scheduleName;
    String createdDate;
    String technicianName;
    String status;
    List<MaintenanceChecklistDetailResponse> details;
}
