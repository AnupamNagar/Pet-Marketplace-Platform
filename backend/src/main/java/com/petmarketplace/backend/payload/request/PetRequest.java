package com.petmarketplace.backend.payload.request;

import com.petmarketplace.backend.model.PetCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PetRequest {

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Breed is required")
    private String breed;

    @NotNull(message = "Age is required")
    @PositiveOrZero(message = "Age must be zero or positive")
    private Integer age;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private PetCategory category;

    private String description;
    
    private List<String> imageUrls;
    
    private String videoUrl;
}
