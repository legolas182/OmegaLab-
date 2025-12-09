package com.plm.plm.Models;

import com.plm.plm.dto.OrdenProduccionDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordenes_produccion",
    indexes = {
        @Index(name = "idx_idea_id", columnList = "idea_id"),
        @Index(name = "idx_estado", columnList = "estado")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenProduccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idea_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orden_idea"))
    private Idea idea;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidad;

    @Column(nullable = false, length = 20)
    private String estado = "EN_PROCESO";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_calidad_id", foreignKey = @ForeignKey(name = "fk_orden_supervisor"))
    private User supervisorCalidad;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private Lote lote;

    public OrdenProduccionDTO getDTO() {
        OrdenProduccionDTO dto = new OrdenProduccionDTO();
        dto.setId(id);
        dto.setCodigo(codigo);
        dto.setIdeaId(idea != null ? idea.getId() : null);
        dto.setIdeaTitulo(idea != null ? idea.getTitulo() : null);
        dto.setCantidad(cantidad);
        dto.setEstado(estado);
        dto.setSupervisorCalidadId(supervisorCalidad != null ? supervisorCalidad.getId() : null);
        dto.setSupervisorCalidadNombre(supervisorCalidad != null ? supervisorCalidad.getNombre() : null);
        dto.setFechaInicio(fechaInicio);
        dto.setFechaFin(fechaFin);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        dto.setLoteId(lote != null ? lote.getId() : null);
        dto.setLoteCodigo(lote != null ? lote.getCodigo() : null);
        return dto;
    }
}

