package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoFormula;
import com.plm.plm.Models.Formula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormulaRepository extends JpaRepository<Formula, Integer> {
    
    Optional<Formula> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
    
    List<Formula> findByEstado(EstadoFormula estado);
    
    List<Formula> findByIdeaId(Integer ideaId);
    
    @Query("SELECT f FROM Formula f WHERE f.nombre LIKE %:search% OR f.codigo LIKE %:search%")
    List<Formula> searchByNombreOrCodigo(@Param("search") String search);
}

