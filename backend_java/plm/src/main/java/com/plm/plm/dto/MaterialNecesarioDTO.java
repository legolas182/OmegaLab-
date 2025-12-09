package com.plm.plm.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialNecesarioDTO {
    private Integer materialId;
    private String materialNombre;
    private String materialCodigo;
    private BigDecimal cantidadRequerida;
    private String unidadRequerida;
    private BigDecimal porcentaje;
    private Integer secuencia;
}

