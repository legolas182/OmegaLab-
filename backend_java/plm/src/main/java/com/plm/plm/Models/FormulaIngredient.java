package com.plm.plm.Models;

import com.plm.plm.dto.FormulaIngredientDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "formula_ingredients",
    indexes = {
        @Index(name = "idx_formula_id", columnList = "formula_id"),
        @Index(name = "idx_material_id", columnList = "material_id"),
        @Index(name = "idx_compound_id", columnList = "compound_id")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulaIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "formula_id", nullable = false, foreignKey = @ForeignKey(name = "fk_formula_ingredient_formula"))
    private Formula formula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", foreignKey = @ForeignKey(name = "fk_formula_ingredient_material"))
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compound_id", foreignKey = @ForeignKey(name = "fk_formula_ingredient_compound"))
    private ChemicalCompound compound;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal cantidad;

    @Column(nullable = false, length = 50)
    private String unidad = "g";

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @Column(length = 100)
    private String funcion;

    @Column(nullable = false)
    private Integer secuencia = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FormulaIngredientDTO getDTO() {
        FormulaIngredientDTO dto = new FormulaIngredientDTO();
        dto.setId(id);
        dto.setFormulaId(formula != null ? formula.getId() : null);
        dto.setMaterialId(material != null ? material.getId() : null);
        dto.setCompoundId(compound != null ? compound.getId() : null);
        dto.setNombre(nombre);
        dto.setCantidad(cantidad != null ? cantidad.doubleValue() : null);
        dto.setUnidad(unidad);
        dto.setPorcentaje(porcentaje != null ? porcentaje.doubleValue() : null);
        dto.setFuncion(funcion);
        dto.setSecuencia(secuencia);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

