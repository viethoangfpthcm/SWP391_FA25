package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Payment;
import com.se1824.SWP391_FA25.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {
    /* Lấy ra những part_id trong cùng 1 checklist có status = "thay thế" */
//    @Autowired
//    private PaymentRepository paymentRepository;
//
//    public List<Payment> getAllPartRepace(String status, int checklistId) {
//        List<Payment> result = new ArrayList<>();
//        result = paymentRepository.findByStatusAndChecklistId(status, checklistId);
//        return result;
//    }
}
