package com.plm.plm.Models;

import com.plm.plm.dto.BOMItemDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bom_items",
    indexes = {
        @Index(name = "idx_bom_id", columnList = "bom_id"),
        @Index(name = "idx_material_id", columnList = "material_id"),
        @Index(name = "idx_secuencia", columnList = "secuencia")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BOMItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bom_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bom_item_bom"))
    private BOM bom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bom_item_material"))
    private Material material;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidad;

    @Column(nullable = false, length = 50)
    private String unidad = "mg";

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer secuencia = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public BOMItemDTO getDTO() {
        BOMItemDTO dto = new BOMItemDTO();
        dto.setId(id);
        dto.setBomId(bom != null ? bom.getId() : null);
        
        if (material != null) {
            dto.setMaterialId(material.getId());
            dto.setMaterialNombre(material.getNombre());
            dto.setMaterialCodigo(material.getCodigo());
            dto.setMaterialUnidadMedida(material.getUnidadMedida());
        }
        
        dto.setCantidad(cantidad);
        dto.setUnidad(unidad);
        dto.setPorcentaje(porcentaje);
        dto.setSecuencia(secuencia);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

