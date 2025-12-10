package com.plm.plm.Models;

import com.plm.plm.dto.LineClearanceDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "line_clearances",
    indexes = {
        @Index(name = "idx_orden_id", columnList = "orden_id"),
        @Index(name = "idx_completado", columnList = "completado")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineClearance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_line_clearance_orden"))
    private OrdenProduccion orden;

    @Column(nullable = false)
    private Boolean completado = false;

    @Column(nullable = false)
    private Boolean lineaLimpia = false;

    @Column(nullable = false)
    private Boolean sinResiduos = false;

    @Column(nullable = false)
    private Boolean equiposVerificados = false;

    @Column(nullable = false)
    private Boolean documentacionCompleta = false;

    @Column(nullable = false)
    private Boolean materialesCorrectos = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "verificado_por", nullable = false, foreignKey = @ForeignKey(name = "fk_line_clearance_usuario"))
    private User verificadoPor;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LineClearanceDTO getDTO() {
        LineClearanceDTO dto = new LineClearanceDTO();
        dto.setId(id);
        dto.setOrdenId(orden != null ? orden.getId() : null);
        dto.setCompletado(completado);
        dto.setLineaLimpia(lineaLimpia);
        dto.setSinResiduos(sinResiduos);
        dto.setEquiposVerificados(equiposVerificados);
        dto.setDocumentacionCompleta(documentacionCompleta);
        dto.setMaterialesCorrectos(materialesCorrectos);
        dto.setVerificadoPorId(verificadoPor != null ? verificadoPor.getId() : null);
        dto.setVerificadoPorNombre(verificadoPor != null ? verificadoPor.getNombre() : null);
        dto.setObservaciones(observaciones);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

