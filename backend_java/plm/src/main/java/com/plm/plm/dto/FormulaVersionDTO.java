package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulaVersionDTO {
    private Integer id;
    private Integer formulaId;
    private String version;
    private String descripcion;
    private String justificacion;
    private String formulaData;
    private LocalDateTime createdAt;
}

