package com.plm.plm.Reposotory;

import com.plm.plm.Models.FormulaVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormulaVersionRepository extends JpaRepository<FormulaVersion, Integer> {
    
    List<FormulaVersion> findByFormulaIdOrderByVersionAsc(Integer formulaId);
    
    Optional<FormulaVersion> findByFormulaIdAndVersion(Integer formulaId, String version);
}

