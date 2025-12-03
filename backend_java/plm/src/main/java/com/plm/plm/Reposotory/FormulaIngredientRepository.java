package com.plm.plm.Reposotory;

import com.plm.plm.Models.FormulaIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormulaIngredientRepository extends JpaRepository<FormulaIngredient, Integer> {
    
    List<FormulaIngredient> findByFormulaIdOrderBySecuenciaAsc(Integer formulaId);
    
    void deleteByFormulaId(Integer formulaId);
}

