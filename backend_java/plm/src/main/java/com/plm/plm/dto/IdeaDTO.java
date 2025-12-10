package com.plm.plm.dto;

import com.plm.plm.Enums.EstadoIdea;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdeaDTO {
    private Integer id;
    private String titulo;
    private String descripcion;
    private String detallesIA; // Respuesta completa de la IA
    private String pruebasRequeridas; // Lista de pruebas requeridas generadas por la IA
    private Integer categoriaId;
    private String prioridad;
    private String objetivo; // Ej: "quiero crear una proteína para diabéticos"
    private Integer productoOrigenId; // ID del producto del inventario analizado
    private String productoOrigenNombre; // Nombre del producto origen
    private Integer asignadoAId; // ID del analista asignado para pruebas
    private String asignadoANombre; // Nombre del analista asignado
    private EstadoIdea estado;
    private Integer createdBy;
    private String createdByName;
    private Integer approvedBy;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private Double cantidadSugerida;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

