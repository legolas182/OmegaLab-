package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulaDTO {
    private Integer id;
    private String codigo;
    private String nombre;
    private String objetivo;
    private Double rendimiento;
    private String estado;
    private Integer ideaId;
    private Integer createdBy;
    private List<FormulaIngredientDTO> ingredientes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

