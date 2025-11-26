package com.plm.plm.Models;

import com.plm.plm.dto.ResultadoPruebaDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "resultados_prueba",
    indexes = {
        @Index(name = "idx_prueba_id", columnList = "prueba_id")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoPrueba {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prueba_id", nullable = false, foreignKey = @ForeignKey(name = "fk_resultado_prueba"))
    private Prueba prueba;

    @Column(nullable = false, length = 255)
    private String parametro;

    @Column(length = 255)
    private String especificacion;

    @Column(nullable = false, length = 255)
    private String resultado;

    @Column(length = 50)
    private String unidad;

    @Column(name = "cumple_especificacion", nullable = false)
    private Boolean cumpleEspecificacion = true;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ResultadoPruebaDTO getDTO() {
        ResultadoPruebaDTO dto = new ResultadoPruebaDTO();
        dto.setId(id);
        dto.setPruebaId(prueba != null ? prueba.getId() : null);
        dto.setParametro(parametro);
        dto.setEspecificacion(especificacion);
        dto.setResultado(resultado);
        dto.setUnidad(unidad);
        dto.setCumpleEspecificacion(cumpleEspecificacion);
        dto.setObservaciones(observaciones);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

