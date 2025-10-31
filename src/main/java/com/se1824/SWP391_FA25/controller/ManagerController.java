package com.se1824.SWP391_FA25.controller;

import com.se1824.SWP391_FA25.entity.Part;
import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.model.request.PartCreateRequest;
import com.se1824.SWP391_FA25.service.AuthenticationService;
import com.se1824.SWP391_FA25.service.ManagerService;
import com.se1824.SWP391_FA25.service.ServiceCenterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "api")
public class ManagerController {
    @Autowired
    ManagerService managerService;
    @Autowired
    ServiceCenterService serviceCenterService;
    @Autowired
    AuthenticationService authentication;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(managerService.getAllUsers());
    }

    @GetMapping("/parts")
    public ResponseEntity<?> getParts() {
        return ResponseEntity.ok(managerService.getAllPart());
    }

    @PostMapping("/parts-create")
    public ResponseEntity<?> createPart(@RequestBody PartCreateRequest partCreateRequest) {
        return ResponseEntity.ok(serviceCenterService.createPart(partCreateRequest, authentication.getCurrentAccount().getCenter().getId()));
    }

    @GetMapping("/parts/{partId}")
    public ResponseEntity<Part> getPartById(@PathVariable Integer partId) {
        Part part = serviceCenterService.getPartById(partId);
        return ResponseEntity.ok(part);
    }

    @PutMapping("/parts/{partId}")
    public ResponseEntity<Part> updatePart(
            @PathVariable Integer partId,
            @Valid @RequestBody PartCreateRequest requestDTO) {

        Part updatedPart = serviceCenterService.updatePart(partId, requestDTO);
        return new ResponseEntity<>(updatedPart, HttpStatus.OK);
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings() {
        Users user = authentication.getCurrentAccount();
        return ResponseEntity.ok(managerService.getAllBookings(user.getUserId()));
    }

    @GetMapping("/payment")
    public ResponseEntity<?> getPayments() {
        Users user = authentication.getCurrentAccount();
        return ResponseEntity.ok(managerService.getPaymentsByCenter(user.getCenter().getId(), user.getUserId()));
    }
}
