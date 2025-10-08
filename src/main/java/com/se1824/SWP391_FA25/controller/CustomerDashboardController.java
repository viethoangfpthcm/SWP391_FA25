package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.CustomerDashboardDTO;
import com.se1824.SWP391_FA25.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
@SecurityRequirement(name = "api")
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerDashboardController {

    private final CustomerDashboardService dashboardService;

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<CustomerDashboardDTO> getDashboard(
            @PathVariable String userId) {
        return ResponseEntity.ok(dashboardService.getDashboard(userId));
    }
}
