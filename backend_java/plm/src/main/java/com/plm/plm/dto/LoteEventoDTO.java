package com.plm.plm.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LoteEventoDTO {
    private Integer id;
    private Integer loteId;
    private String tipo;
    private String descripcion;
    private LocalDateTime fecha;
    private String hora;
    private String identificador;
    private Integer usuarioId;
    private String usuarioNombre;
    private String detalles;
    private LocalDateTime createdAt;
}

