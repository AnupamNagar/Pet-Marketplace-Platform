package com.petmarketplace.backend.repository;

import com.petmarketplace.backend.model.Pet;
import com.petmarketplace.backend.model.PetCategory;
import com.petmarketplace.backend.model.PetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByStatus(PetStatus status);

    List<Pet> findByCategoryAndStatus(PetCategory category, PetStatus status);

    List<Pet> findBySellerId(Long sellerId);
    
    @Query("SELECT p FROM Pet p WHERE p.status = 'AVAILABLE' AND (LOWER(p.breed) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Pet> searchAvailablePets(String keyword);
}
