package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoPruebaDTO {
    private Integer id;
    private Integer pruebaId;
    private String parametro;
    private String especificacion;
    private String resultado;
    private String unidad;
    private Boolean cumpleEspecificacion;
    private String observaciones;
    private LocalDateTime createdAt;
}

