package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineClearanceDTO {
    private Integer id;
    private Integer ordenId;
    private Boolean completado;
    private Boolean lineaLimpia;
    private Boolean sinResiduos;
    private Boolean equiposVerificados;
    private Boolean documentacionCompleta;
    private Boolean materialesCorrectos;
    private Integer verificadoPorId;
    private String verificadoPorNombre;
    private String observaciones;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

