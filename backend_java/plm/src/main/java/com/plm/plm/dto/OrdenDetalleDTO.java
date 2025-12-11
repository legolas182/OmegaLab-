package com.plm.plm.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdenDetalleDTO {
    private Integer id;
    private String codigo;
    private String ideaTitulo;
    private String ideaDescripcion;
    private String ideaObjetivo;
    private String ideaCategoria;
    private String ideaCreatedByName;
    private LocalDateTime ideaCreatedAt;
    private String ideaAsignadoANombre;
    private BigDecimal cantidad;
    private String estado;
    private String supervisorCalidadNombre;
    private Integer loteId;
    private String loteCodigo;
    private List<MaterialNecesarioDTO> materiales;
}

