package com.petmarketplace.backend.payload.event;

import java.math.BigDecimal;

public class OrderEvent {
    private Long transactionId;
    private Long petId;
    private String petName;
    private String buyerEmail;
    private String sellerEmail;
    private BigDecimal amount;

    public OrderEvent() {}

    public OrderEvent(Long transactionId, Long petId, String petName, String buyerEmail, String sellerEmail, BigDecimal amount) {
        this.transactionId = transactionId;
        this.petId = petId;
        this.petName = petName;
        this.buyerEmail = buyerEmail;
        this.sellerEmail = sellerEmail;
        this.amount = amount;
    }

    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    @Override
    public String toString() {
        return "OrderEvent{" +
                "transactionId=" + transactionId +
                ", petId=" + petId +
                ", petName='" + petName + '\'' +
                ", buyerEmail='" + buyerEmail + '\'' +
                ", sellerEmail='" + sellerEmail + '\'' +
                ", amount=" + amount +
                '}';
    }
}
