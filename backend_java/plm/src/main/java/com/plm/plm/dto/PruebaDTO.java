package com.plm.plm.dto;

import com.plm.plm.Enums.EstadoPrueba;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PruebaDTO {
    private Integer id;
    private Integer ideaId;
    private String ideaTitulo;
    private String ideaEstado;
    private String codigoMuestra;
    private String tipoPrueba;
    private String descripcion;
    private EstadoPrueba estado;
    private LocalDateTime fechaMuestreo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String resultado;
    private String observaciones;
    private String equiposUtilizados;
    private String pruebasRequeridas;
    private Integer analistaId;
    private String analistaNombre;
    private List<ResultadoPruebaDTO> resultados;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

