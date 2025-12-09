package com.plm.plm.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LoteDTO {
    private Integer id;
    private String codigo;
    private Integer ordenId;
    private String ordenCodigo;
    private String productoNombre;
    private LocalDateTime fechaProduccion;
    private String estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LoteEventoDTO> eventos;
}

