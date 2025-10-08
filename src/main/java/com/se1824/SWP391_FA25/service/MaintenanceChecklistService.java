package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.MaintenanceChecklist;
import com.se1824.SWP391_FA25.entity.MaintenanceChecklistDetail;
import com.se1824.SWP391_FA25.exception.exceptions.ResourceNotFoundException;
import com.se1824.SWP391_FA25.repository.MaintenanceChecklistDetailRepository;
import com.se1824.SWP391_FA25.repository.MaintenanceChecklistRepository;
import jakarta.transaction.Transactional;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level =  AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class MaintenanceChecklistService {
    MaintenanceChecklistRepository checklistRepo;
    MaintenanceChecklistDetailRepository detailRepo;
    public List<MaintenanceChecklist> getChecklistByCustomer(String customerId) {
        return checklistRepo.findByBooking_Customer_UserId(customerId);
    }

    public List<MaintenanceChecklist> getChecklistByTechnician(String technicianId) {
        return checklistRepo.findByTechnician_UserId(technicianId);
    }

    /**
     * Technician bắt đầu quá trình bảo dưỡng (Start Maintenance)
     * => cập nhật trạng thái checklist sang "In Progress"
     */
    @Transactional
    public void startMaintenance(Integer bookingId) {
        MaintenanceChecklist checklist = checklistRepo.findByBooking_BookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found for bookingId: " + bookingId));

        checklist.setStatus("In Progress");

    }

    /**
     * Cập nhật chi tiết từng hạng mục trong checklist
     */
    @Transactional
    public void updateChecklistDetail(Integer detailId, String status, String note) {
        MaintenanceChecklistDetail detail = detailRepo.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist detail not found"));
        detail.setStatus(status);
        detail.setNote(note);
    }
}
