package com.plm.plm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BOMItemDTO {
    private Integer id;
    
    @JsonProperty("bomId")
    private Integer bomId;
    
    @JsonProperty("materialId")
    private Integer materialId;
    
    private String materialNombre;
    private String materialCodigo;
    private String materialUnidadMedida;
    
    private BigDecimal cantidad;
    private String unidad;
    private BigDecimal porcentaje;
    private Integer secuencia;
    private LocalDateTime createdAt;
}

