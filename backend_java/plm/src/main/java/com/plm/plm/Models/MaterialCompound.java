package com.plm.plm.Models;

import com.plm.plm.dto.MaterialCompoundDTO;
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
@Table(name = "material_compounds",
    indexes = {
        @Index(name = "idx_material_id", columnList = "material_id"),
        @Index(name = "idx_tipo_compuesto", columnList = "tipo_compuesto"),
        @Index(name = "idx_nombre_compuesto", columnList = "nombre_compuesto")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialCompound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false, foreignKey = @ForeignKey(name = "fk_material_compound_material"))
    private Material material;

    @Column(name = "nombre_compuesto", nullable = false, length = 255)
    private String nombreCompuesto;

    @Column(name = "formula_molecular", length = 100)
    private String formulaMolecular;

    @Column(name = "peso_molecular", precision = 10, scale = 4)
    private BigDecimal pesoMolecular;

    @Column(name = "porcentaje_concentracion", precision = 5, scale = 2)
    private BigDecimal porcentajeConcentracion;

    @Column(name = "tipo_compuesto", length = 100)
    private String tipoCompuesto;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MaterialCompoundDTO getDTO() {
        MaterialCompoundDTO dto = new MaterialCompoundDTO();
        dto.setId(this.id);
        dto.setMaterialId(this.material != null ? this.material.getId() : null);
        dto.setNombreCompuesto(this.nombreCompuesto);
        dto.setFormulaMolecular(this.formulaMolecular);
        dto.setPesoMolecular(this.pesoMolecular);
        dto.setPorcentajeConcentracion(this.porcentajeConcentracion);
        dto.setTipoCompuesto(this.tipoCompuesto);
        dto.setDescripcion(this.descripcion);
        dto.setCreatedAt(this.createdAt);
        dto.setUpdatedAt(this.updatedAt);
        return dto;
    }
}

