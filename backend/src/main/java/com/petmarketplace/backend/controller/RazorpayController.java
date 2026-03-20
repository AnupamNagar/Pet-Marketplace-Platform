package com.petmarketplace.backend.controller;

import com.petmarketplace.backend.model.Pet;
import com.petmarketplace.backend.payload.request.PaymentVerifyRequest;
import com.petmarketplace.backend.payload.request.TransactionRequest;
import com.petmarketplace.backend.payload.response.MessageResponse;
import com.petmarketplace.backend.repository.PetRepository;
import com.petmarketplace.backend.service.RazorpayService;
import com.petmarketplace.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class RazorpayController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PetRepository petRepository;

    /**
     * Step 1: Buyer clicks "Buy Now" → frontend calls this to create a Razorpay
     * Order.
     * Returns: orderId, amount, keyId — needed to open Razorpay checkout popup.
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('BUYER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody TransactionRequest request) {
        try {
            System.out.println("🚀 Received create-order request for pet ID: " + request.getPetId());
            Pet pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new RuntimeException("Pet not found"));

            java.util.Map<String, Object> orderData = razorpayService.createOrder(pet);
            return ResponseEntity.ok(orderData);
        } catch (Exception e) {
            System.err.println("❌ ERROR in createOrder:");
            e.printStackTrace(); // This will print the FULL STACK TRACE to the console
            return ResponseEntity.internalServerError().body(new MessageResponse("Backend Error: " + e.getMessage()));
        }
    }

    /**
     * Step 2: After buyer completes payment in Razorpay popup → frontend calls this
     * to verify.
     * Verifies HMAC-SHA256 signature, then records the transaction and fires Kafka
     * event.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('BUYER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request,
            Authentication authentication) {
        boolean signatureValid = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if (!signatureValid) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Payment verification failed — invalid signature."));
        }

        try {
            TransactionRequest txRequest = new TransactionRequest();
            txRequest.setPetId(request.getPetId());
            var transaction = transactionService.processCheckout(txRequest, authentication.getName());
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Step 3: Webhook (Backup) — Razorpay calls this if the user closes the
     * browser.
     * For now, we just log it. In production, this would fulfill the order if
     * /verify wasn't called.
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        // In a real app, you'd verify signature here and update DB
        System.out.println("🔔 Razorpay Webhook Received!");
        return ResponseEntity.ok().build();
    }
}
