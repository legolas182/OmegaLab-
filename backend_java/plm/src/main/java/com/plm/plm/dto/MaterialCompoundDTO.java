package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialCompoundDTO {
    private Integer id;
    private Integer materialId;
    private String nombreCompuesto;
    private String formulaMolecular;
    private BigDecimal pesoMolecular;
    private BigDecimal porcentajeConcentracion;
    private String tipoCompuesto;
    private String descripcion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

