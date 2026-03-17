package com.petmarketplace.backend.controller;

import com.petmarketplace.backend.model.PetCategory;
import com.petmarketplace.backend.model.PetStatus;
import com.petmarketplace.backend.payload.request.PetRequest;
import com.petmarketplace.backend.payload.response.MessageResponse;
import com.petmarketplace.backend.payload.response.PetResponse;
import com.petmarketplace.backend.service.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pets")
public class PetController {

    @Autowired
    private PetService petService;

    // Public API - Everyone can view available pets
    @GetMapping("/available")
    public ResponseEntity<List<PetResponse>> getAvailablePets() {
        return ResponseEntity.ok(petService.getAvailablePets());
    }

    // Public API - View single pet
    @GetMapping("/{id}")
    public ResponseEntity<PetResponse> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    // Public API - Search and Filter
    @GetMapping("/search")
    public ResponseEntity<List<PetResponse>> searchPets(
            @RequestParam(required = false) PetCategory category,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(petService.searchAndFilterAvailablePets(category, keyword));
    }

    // Public API - View pets by a specific seller
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<PetResponse>> getPetsBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(petService.getPetsBySeller(sellerId));
    }

    // Secured API - Only Sellers and Admins can create listings
    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<PetResponse> createPetListing(@Valid @RequestBody PetRequest petRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PetResponse response = petService.createPet(petRequest, username);
        return ResponseEntity.ok(response);
    }

    // Secured API - Update status (Seller/Admin only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<PetResponse> updatePetStatus(
            @PathVariable Long id,
            @RequestParam PetStatus status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PetResponse response = petService.updatePetStatus(id, status, username);
        return ResponseEntity.ok(response);
    }

    // Secured API - Delete listing (Seller/Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deletePetListing(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        petService.deletePet(id, username);
        return ResponseEntity.ok(new MessageResponse("Pet listing deleted successfully!"));
    }
}
