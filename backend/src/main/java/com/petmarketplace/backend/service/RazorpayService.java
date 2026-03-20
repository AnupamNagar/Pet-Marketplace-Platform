package com.petmarketplace.backend.service;

import com.petmarketplace.backend.model.Pet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Map;

/**
 * RazorpayService — uses direct REST API calls instead of the Java SDK.
 * This sidesteps an OkHttp ClassCastException bug in razorpay-java.
 */
@Service
public class RazorpayService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);
    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RestTemplate restTemplate = new RestTemplate();

    /**
     * Creates a Razorpay Order via direct REST API (no SDK).
     * Returns orderId, amount, currency, keyId for the frontend.
     */
    public Map<String, Object> createOrder(Pet pet) {
        long amountInPaise = pet.getPrice()
                .multiply(new java.math.BigDecimal("100"))
                .longValue();

        // Build request body
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", "INR");
        body.put("receipt", "petverse_" + pet.getId());
        body.put("payment_capture", 1);

        Map<String, String> notes = new HashMap<>();
        notes.put("petId", String.valueOf(pet.getId()));
        notes.put("petName", pet.getName());
        body.put("notes", notes);

        // Build Basic Auth header: Base64(keyId:keySecret)
        String credentials = keyId + ":" + keySecret;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encoded);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> razorpayResponse = restTemplate.postForEntity(
                RAZORPAY_ORDERS_URL, entity, Map.class);

        Map<?, ?> rzpBody = razorpayResponse.getBody();
        if (rzpBody == null || rzpBody.get("id") == null) {
            throw new RuntimeException("Failed to create Razorpay order — empty response");
        }

        String orderId = String.valueOf(rzpBody.get("id"));
        logger.info("Razorpay Order created (REST): {}", orderId);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", keyId);
        response.put("petName", pet.getName());
        response.put("petId", pet.getId());
        return response;
    }

    /**
     * Verifies the Razorpay payment signature to prevent fraud.
     * HMAC-SHA256: razorpay_order_id + "|" + razorpay_payment_id, signed with keySecret.
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            Formatter formatter = new Formatter();
            for (byte b : hash) {
                formatter.format("%02x", b);
            }
            String generatedSignature = formatter.toString();
            formatter.close();

            boolean valid = generatedSignature.equals(signature);
            logger.info("Razorpay signature verification: {}", valid ? "VALID ✅" : "INVALID ❌");
            return valid;
        } catch (Exception e) {
            logger.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }
}
