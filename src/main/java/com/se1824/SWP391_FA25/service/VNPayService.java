package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.config.VNPayConfig;
import com.se1824.SWP391_FA25.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {
    private final VNPayConfig vnPayConfig;

    public String createOrder(int total, String orderInfo, String paymentId, Users customer, String ipAddress) {
        long amount = total * 100L;
        String vnp_TxnRef = paymentId + "_" + System.currentTimeMillis();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.VNP_VERSION);
        vnp_Params.put("vnp_Command", VNPayConfig.VNP_COMMAND);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", VNPayConfig.VNP_ORDER_TYPE);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        if (customer != null) {
            vnp_Params.put("vnp_Bill_Mobile", customer.getPhone());
            vnp_Params.put("vnp_Bill_Email", customer.getEmail());
            String fullName = customer.getFullName().trim();
            if (!fullName.isEmpty()) {
                int idx = fullName.lastIndexOf(' ');
                if (idx > 0) {
                    String firstName = fullName.substring(0, idx);
                    String lastName = fullName.substring(idx + 1);
                    vnp_Params.put("vnp_Bill_FirstName", firstName);
                    vnp_Params.put("vnp_Bill_LastName", lastName);
                } else {
                    vnp_Params.put("vnp_Bill_FirstName", fullName);
                    vnp_Params.put("vnp_Bill_LastName", fullName);
                }
            }
        }

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {


                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                } catch (Exception e) {


                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getVnp_Url() + "?" + queryUrl;
    }

}