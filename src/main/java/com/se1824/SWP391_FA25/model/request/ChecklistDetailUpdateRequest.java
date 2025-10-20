package com.se1824.SWP391_FA25.model.request;

public record ChecklistDetailUpdateRequest(String status,
                                           String note,
                                           Integer partId) {

}
