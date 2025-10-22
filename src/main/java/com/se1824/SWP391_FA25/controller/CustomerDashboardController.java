package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.dto.CustomerDashboardDTO;
import com.se1824.SWP391_FA25.dto.VehicleScheduleStatusDTO;

import com.se1824.SWP391_FA25.entity.ServiceCenter;
import com.se1824.SWP391_FA25.entity.Vehicle;
import com.se1824.SWP391_FA25.model.response.PaymentResponse;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.BookingService;
import com.se1824.SWP391_FA25.service.CustomerDashboardService;
import com.se1824.SWP391_FA25.service.ServiceCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@SecurityRequirement(name = "api")
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerDashboardController {

    private final CustomerDashboardService dashboardService;

    private final BookingService bookingService;
    private final ServiceCenterService serviceCenterService;
    //private final AuthenticationService authenticationService;
    @Autowired
    private AuthenticationService authenticationService;

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<CustomerDashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    /**
     * Endpoint để lấy danh sách các Booking đã sẵn sàng thanh toán
     */
    @GetMapping("/payments/ready")
    public ResponseEntity<List<PaymentResponse>> getReadyForPaymentBookings() {
        Integer userId = authenticationService.getCurrentAccount().getUserId();
        List<PaymentResponse> payement = bookingService.getBookingsReadyForPayment(userId);
        return ResponseEntity.ok(payement);
    }

    /**
     * Lấy danh sách các gói bảo dưỡng cho một xe cụ thể
     * GET /api/customer/maintenance-schedule?licensePlate={licensePlate}
     */
    @GetMapping("/maintenance-schedule")
    public ResponseEntity<List<VehicleScheduleStatusDTO>> getMaintenanceScheduleForVehicle(
            @RequestParam String licensePlate) {
        List<VehicleScheduleStatusDTO> schedule = dashboardService.getVehicleMaintenanceSchedule(licensePlate);
        return ResponseEntity.ok(schedule);
    }

    @PostMapping("/create-vehicle")
    public ResponseEntity<?> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(dashboardService.createVehicle(vehicle));
    }
    /**
     * READ (All): Lấy tất cả các ServiceCenter
     * GET /api/customer/service-centers
     */
    @GetMapping("/service-centers")
    public ResponseEntity<List<ServiceCenter>> getAllServiceCenters() {
        List<ServiceCenter> centers = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(centers);
    }
}
