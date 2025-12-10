package com.plm.plm.services;

import com.plm.plm.dto.FormulaDTO;
import com.plm.plm.dto.FormulaIngredientDTO;
import com.plm.plm.dto.FormulaVersionDTO;

import java.util.List;
import java.util.Map;

public interface FormulaService {
    
    /**
     * Crear fórmula experimental desde materias primas
     */
    FormulaDTO createFormulaFromMaterials(
        String nombre,
        String objetivo,
        Double rendimiento,
        List<FormulaIngredientDTO> ingredientes,
        Integer userId
    );
    
    /**
     * Crear variante de fórmula (nueva versión)
     */
    FormulaDTO createVariant(
        Integer formulaId,
        String version,
        String justificacion,
        List<FormulaIngredientDTO> ingredientes,
        Integer userId
    );
    
    /**
     * Obtener fórmula por ID
     */
    FormulaDTO getFormulaById(Integer id);
    
    /**
     * Obtener todas las fórmulas
     */
    List<FormulaDTO> getAllFormulas(String estado, String search);
    
    /**
     * Obtener todas las versiones de una fórmula
     */
    List<FormulaVersionDTO> getFormulaVersions(Integer formulaId);
    
    /**
     * Actualizar fórmula
     */
    FormulaDTO updateFormula(Integer id, FormulaDTO formulaDTO);
    
    /**
     * Cambiar estado de fórmula
     */
    FormulaDTO changeEstado(Integer id, String nuevoEstado, Integer userId);
    
    /**
     * Eliminar fórmula
     */
    void deleteFormula(Integer id);
    
    /**
     * Validar fórmula (verificar que suma 100%, etc.)
     */
    Map<String, Object> validateFormula(FormulaDTO formula);
    
    /**
     * Obtener fórmula por ideaId
     */
    FormulaDTO getFormulaByIdeaId(Integer ideaId);

    /**
     * Crear fórmula desde una idea aprobada
     */
    FormulaDTO createFormulaFromIdea(Integer ideaId, Integer userId);
}

