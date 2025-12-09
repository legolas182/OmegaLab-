package com.plm.plm.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrdenDetalleDTO {
    private Integer id;
    private String codigo;
    private String ideaTitulo;
    private BigDecimal cantidad;
    private String estado;
    private String supervisorCalidadNombre;
    private Integer loteId;
    private String loteCodigo;
    private List<MaterialNecesarioDTO> materiales;
}

