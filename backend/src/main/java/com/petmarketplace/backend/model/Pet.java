package com.petmarketplace.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Data
@NoArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Breed is required")
    private String breed;

    @NotNull(message = "Age is required")
    @PositiveOrZero(message = "Age must be zero or positive")
    private Integer age; // in months or years, specify in docs

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PetCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PetStatus status = PetStatus.AVAILABLE;

    @ElementCollection
    @CollectionTable(name = "pet_images", joinColumns = @JoinColumn(name = "pet_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @Column(length = 500)
    private String videoUrl;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Pet(String name, String breed, Integer age, BigDecimal price, PetCategory category, String description, User seller) {
        this.name = name;
        this.breed = breed;
        this.age = age;
        this.price = price;
        this.category = category;
        this.description = description;
        this.seller = seller;
        this.status = PetStatus.AVAILABLE;
    }
}
