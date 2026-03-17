package com.petmarketplace.backend.payload.response;

import com.petmarketplace.backend.model.PetCategory;
import com.petmarketplace.backend.model.PetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PetResponse {
    private Long id;
    private String name;
    private String breed;
    private Integer age;
    private BigDecimal price;
    private PetCategory category;
    private PetStatus status;
    private String description;
    private List<String> imageUrls;
    private String videoUrl;
    
    // Seller details
    private Long sellerId;
    private String sellerUsername;
    private String sellerEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
