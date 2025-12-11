package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenProduccionDTO {
    private Integer id;
    private String codigo;
    private Integer ideaId;
    private String ideaTitulo;
    private BigDecimal cantidad;
    private String estado;
    private Integer supervisorCalidadId;
    private String supervisorCalidadNombre;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer loteId;
    private String loteCodigo;
}

