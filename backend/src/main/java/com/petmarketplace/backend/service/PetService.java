package com.petmarketplace.backend.service;

import com.petmarketplace.backend.model.Pet;
import com.petmarketplace.backend.model.PetCategory;
import com.petmarketplace.backend.model.PetStatus;
import com.petmarketplace.backend.model.User;
import com.petmarketplace.backend.payload.request.PetRequest;
import com.petmarketplace.backend.payload.response.PetResponse;
import com.petmarketplace.backend.repository.PetRepository;
import com.petmarketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    public PetResponse createPet(PetRequest petRequest, String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        Pet pet = new Pet(
                petRequest.getName(),
                petRequest.getBreed(),
                petRequest.getAge(),
                petRequest.getPrice(),
                petRequest.getCategory(),
                petRequest.getDescription(),
                seller
        );
        if (petRequest.getImageUrls() != null && !petRequest.getImageUrls().isEmpty()) {
            pet.setImageUrls(petRequest.getImageUrls());
        }
        
        if (petRequest.getVideoUrl() != null && !petRequest.getVideoUrl().isEmpty()) {
            pet.setVideoUrl(petRequest.getVideoUrl());
        }

        Pet savedPet = petRepository.save(pet);
        return mapToPetResponse(savedPet);
    }

    public List<PetResponse> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::mapToPetResponse)
                .collect(Collectors.toList());
    }

    public List<PetResponse> getAvailablePets() {
        return petRepository.findByStatus(PetStatus.AVAILABLE).stream()
                .map(this::mapToPetResponse)
                .collect(Collectors.toList());
    }

    public PetResponse getPetById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Pet not found."));
        return mapToPetResponse(pet);
    }

    public List<PetResponse> searchAndFilterAvailablePets(PetCategory category, String keyword) {
        List<Pet> pets;
        
        if (category != null && keyword != null && !keyword.trim().isEmpty()) {
             pets = petRepository.searchAvailablePets(keyword).stream()
                     .filter(p -> p.getCategory() == category)
                     .collect(Collectors.toList());
        } else if (category != null) {
             pets = petRepository.findByCategoryAndStatus(category, PetStatus.AVAILABLE);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
             pets = petRepository.searchAvailablePets(keyword);
        } else {
             pets = petRepository.findByStatus(PetStatus.AVAILABLE);
        }
        
        return pets.stream().map(this::mapToPetResponse).collect(Collectors.toList());
    }

    public List<PetResponse> getPetsBySeller(Long sellerId) {
        return petRepository.findBySellerId(sellerId).stream()
                .map(this::mapToPetResponse)
                .collect(Collectors.toList());
    }

    public PetResponse updatePetStatus(Long id, PetStatus status, String username) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Pet not found."));

        if (!pet.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("Error: Unauthorized to update this pet.");
        }

        pet.setStatus(status);
        Pet updatedPet = petRepository.save(pet);
        return mapToPetResponse(updatedPet);
    }

    public void deletePet(Long id, String username) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Pet not found."));

        if (!pet.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("Error: Unauthorized to delete this pet.");
        }

        petRepository.delete(pet);
    }

    private PetResponse mapToPetResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .price(pet.getPrice())
                .category(pet.getCategory())
                .status(pet.getStatus())
                .description(pet.getDescription())
                .imageUrls(pet.getImageUrls())
                .videoUrl(pet.getVideoUrl())
                .sellerId(pet.getSeller().getId())
                .sellerUsername(pet.getSeller().getUsername())
                .sellerEmail(pet.getSeller().getEmail())
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }
}
