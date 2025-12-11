package com.plm.plm.Models;

import com.plm.plm.dto.DispensacionItemDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispensacion_items",
    indexes = {
        @Index(name = "idx_dispensacion_id", columnList = "dispensacion_id"),
        @Index(name = "idx_material_id", columnList = "material_id")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispensacionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dispensacion_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dispensacion_item_dispensacion"))
    private Dispensacion dispensacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dispensacion_item_material"))
    private Material material;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidadRequerida;

    @Column(nullable = false, length = 50)
    private String unidadRequerida;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidadPesada;

    @Column(nullable = false)
    private Integer secuencia = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DispensacionItemDTO getDTO() {
        DispensacionItemDTO dto = new DispensacionItemDTO();
        dto.setId(id);
        dto.setDispensacionId(dispensacion != null ? dispensacion.getId() : null);
        dto.setMaterialId(material != null ? material.getId() : null);
        dto.setMaterialNombre(material != null ? material.getNombre() : null);
        dto.setMaterialCodigo(material != null ? material.getCodigo() : null);
        dto.setCantidadRequerida(cantidadRequerida);
        dto.setUnidadRequerida(unidadRequerida);
        dto.setCantidadPesada(cantidadPesada);
        dto.setSecuencia(secuencia);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

