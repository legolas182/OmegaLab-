package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoFormula;
import com.plm.plm.dto.FormulaDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "formulas",
    indexes = {
        @Index(name = "idx_estado", columnList = "estado"),
        @Index(name = "idx_idea_id", columnList = "idea_id"),
        @Index(name = "idx_codigo", columnList = "codigo")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_codigo", columnNames = "codigo")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String objetivo;

    @Column(precision = 10, scale = 4)
    private BigDecimal rendimiento = BigDecimal.valueOf(100.0);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoFormula estado = EstadoFormula.DISENADA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", foreignKey = @ForeignKey(name = "fk_formula_idea"))
    private Idea idea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_formula_creador"))
    private User creador;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "formula", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("secuencia ASC")
    private List<FormulaIngredient> ingredientes = new ArrayList<>();

    @OneToMany(mappedBy = "formula", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("version ASC")
    private List<FormulaVersion> versiones = new ArrayList<>();

    public FormulaDTO getDTO() {
        FormulaDTO dto = new FormulaDTO();
        dto.setId(id);
        dto.setCodigo(codigo);
        dto.setNombre(nombre);
        dto.setObjetivo(objetivo);
        dto.setRendimiento(rendimiento != null ? rendimiento.doubleValue() : null);
        dto.setEstado(estado != null ? estado.getValue() : null);
        dto.setIdeaId(idea != null ? idea.getId() : null);
        dto.setCreatedBy(creador != null ? creador.getId() : null);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);

        if (ingredientes != null) {
            dto.setIngredientes(ingredientes.stream()
                .map(FormulaIngredient::getDTO)
                .collect(Collectors.toList()));
        }

        return dto;
    }
}

