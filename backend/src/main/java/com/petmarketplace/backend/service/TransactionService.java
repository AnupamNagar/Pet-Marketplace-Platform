package com.petmarketplace.backend.service;

import com.petmarketplace.backend.kafka.OrderEventProducer;
import com.petmarketplace.backend.model.*;
import com.petmarketplace.backend.payload.event.OrderEvent;
import com.petmarketplace.backend.payload.request.TransactionRequest;
import com.petmarketplace.backend.payload.response.TransactionResponse;
import com.petmarketplace.backend.repository.PetRepository;
import com.petmarketplace.backend.repository.TransactionRepository;
import com.petmarketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderEventProducer orderEventProducer;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5% platform fee

    @Transactional
    public TransactionResponse processCheckout(TransactionRequest request, String buyerUsername) {
        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getStatus().equals(PetStatus.AVAILABLE)) {
            throw new RuntimeException("Pet is no longer available for purchase");
        }

        if (pet.getSeller().getId().equals(buyer.getId())) {
            throw new RuntimeException("Seller cannot buy their own pet");
        }

        // Calculate financial fees
        BigDecimal amount = pet.getPrice();
        BigDecimal commissionFee = amount.multiply(COMMISSION_RATE);
        BigDecimal payoutAmount = amount.subtract(commissionFee);

        // Record the physical Transaction
        Transaction transaction = new Transaction(
                pet, buyer, pet.getSeller(), amount, commissionFee, payoutAmount, TransactionStatus.COMPLETED
        );
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update Pet status out of marketplace inventory
        pet.setStatus(PetStatus.SOLD);
        petRepository.save(pet);

        // Fire asynchronous Kafka Event for Notification Services
        OrderEvent event = new OrderEvent(
                savedTransaction.getId(),
                pet.getId(),
                pet.getName(),
                buyer.getEmail(),
                pet.getSeller().getEmail(),
                amount
        );
        orderEventProducer.sendOrderEvent(event);

        return mapToResponse(savedTransaction);
    }

    public List<TransactionResponse> getBuyerTransactions(String username) {
        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<TransactionResponse> getSellerTransactions(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getPet().getId(),
                t.getPet().getName(),
                t.getSeller().getUsername(),
                t.getBuyer().getUsername(),
                t.getAmount(),
                t.getStatus(),
                t.getCreatedAt()
        );
    }
}
