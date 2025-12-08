package com.plm.plm.Reposotory;

import com.plm.plm.Models.ChemicalCompound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChemicalCompoundRepository extends JpaRepository<ChemicalCompound, Integer> {
    
    Optional<ChemicalCompound> findByInchiKey(String inchiKey);
    
    Optional<ChemicalCompound> findBySourceAndSourceId(ChemicalCompound.ChemicalSource source, String sourceId);
    
    @Query("SELECT c FROM ChemicalCompound c WHERE c.name LIKE %:search% OR c.formula LIKE %:search%")
    List<ChemicalCompound> searchByNameOrFormula(@Param("search") String search);
    
    List<ChemicalCompound> findBySource(ChemicalCompound.ChemicalSource source);
}

