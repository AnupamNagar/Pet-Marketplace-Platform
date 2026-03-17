package com.petmarketplace.backend.controller;

import com.petmarketplace.backend.payload.request.TransactionRequest;
import com.petmarketplace.backend.payload.response.MessageResponse;
import com.petmarketplace.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('BUYER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkout(@Valid @RequestBody TransactionRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(transactionService.processCheckout(request, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/buyer")
    @PreAuthorize("hasRole('BUYER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBuyerTransactions(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getBuyerTransactions(authentication.getName()));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSellerTransactions(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getSellerTransactions(authentication.getName()));
    }
}
