package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulaIngredientDTO {
    private Integer id;
    private Integer formulaId;
    private Integer materialId;
    private Integer compoundId;
    private String nombre;
    private Double cantidad;
    private String unidad;
    private Double porcentaje;
    private String funcion;
    private Integer secuencia;
    private LocalDateTime createdAt;
}

