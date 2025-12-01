package com.plm.plm.dto;

import com.plm.plm.Enums.EstadoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialDTO {
    private Integer id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Integer categoriaId;
    private String tipo; // MATERIA_PRIMA o COMPONENTE (derivado de la categoría)
    private String unidadMedida;
    private EstadoUsuario estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

