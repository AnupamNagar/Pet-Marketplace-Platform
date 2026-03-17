package com.petmarketplace.backend.payload.request;

import jakarta.validation.constraints.NotNull;

public class TransactionRequest {
    @NotNull(message = "Pet ID cannot be null")
    private Long petId;

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }
}
