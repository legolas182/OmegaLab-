package com.plm.plm.Models;

import com.plm.plm.dto.FormulaVersionDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "formula_versions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_formula_version", columnNames = {"formula_id", "version"})
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulaVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "formula_id", nullable = false, foreignKey = @ForeignKey(name = "fk_formula_version_formula"))
    private Formula formula;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String justificacion;

    @Column(name = "formula_data", columnDefinition = "JSON")
    private String formulaData;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FormulaVersionDTO getDTO() {
        FormulaVersionDTO dto = new FormulaVersionDTO();
        dto.setId(id);
        dto.setFormulaId(formula != null ? formula.getId() : null);
        dto.setVersion(version);
        dto.setDescripcion(descripcion);
        dto.setJustificacion(justificacion);
        dto.setFormulaData(formulaData);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

