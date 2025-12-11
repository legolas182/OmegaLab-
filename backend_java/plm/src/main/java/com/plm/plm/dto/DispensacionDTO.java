package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispensacionDTO {
    private Integer id;
    private Integer ordenId;
    private Boolean completada;
    private Integer realizadaPorId;
    private String realizadaPorNombre;
    private String equipoUtilizado;
    private LocalDateTime fechaCalibracion;
    private List<DispensacionItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

