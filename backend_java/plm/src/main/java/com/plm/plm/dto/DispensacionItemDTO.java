package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispensacionItemDTO {
    private Integer id;
    private Integer dispensacionId;
    private Integer materialId;
    private String materialNombre;
    private String materialCodigo;
    private BigDecimal cantidadRequerida;
    private String unidadRequerida;
    private BigDecimal cantidadPesada;
    private Integer secuencia;
    private LocalDateTime createdAt;
}

