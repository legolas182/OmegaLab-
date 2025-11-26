package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.dto.IdeaDTO;
import com.plm.plm.Models.Product;
import com.plm.plm.Models.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ideas",
    indexes = {
        @Index(name = "idx_estado", columnList = "estado"),
        @Index(name = "idx_categoria_id", columnList = "categoria_id"),
        @Index(name = "idx_prioridad", columnList = "prioridad"),
        @Index(name = "idx_created_by", columnList = "created_by")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "detalles_ia", columnDefinition = "LONGTEXT")
    private String detallesIA; // Respuesta completa de la IA con BOM modificado, escenarios, etc.

    @Column(name = "pruebas_requeridas", columnDefinition = "TEXT")
    private String pruebasRequeridas; // Lista de pruebas requeridas generadas por la IA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", foreignKey = @ForeignKey(name = "fk_idea_categoria"))
    private Category categoriaEntity;

    @Column(length = 20)
    private String prioridad;

    @Column(columnDefinition = "TEXT")
    private String objetivo; // Ej: "quiero crear una proteína para diabéticos"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_origen_id", foreignKey = @ForeignKey(name = "fk_idea_producto_origen"))
    private Product productoOrigen; // Producto del inventario que se analizó

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_a", foreignKey = @ForeignKey(name = "fk_idea_asignado"))
    private User asignadoA; // Analista asignado para pruebas

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoIdea estado = EstadoIdea.GENERADA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_idea_creador"))
    private User creador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", foreignKey = @ForeignKey(name = "fk_idea_aprobador"))
    private User aprobador;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public IdeaDTO getDTO() {
        IdeaDTO dto = new IdeaDTO();
        dto.setId(id);
        dto.setTitulo(titulo);
        dto.setDescripcion(descripcion);
        dto.setDetallesIA(detallesIA);
        dto.setPruebasRequeridas(pruebasRequeridas);
        dto.setCategoriaId(categoriaEntity != null ? categoriaEntity.getId() : null);
        dto.setPrioridad(prioridad);
        dto.setObjetivo(objetivo);
        dto.setProductoOrigenId(productoOrigen != null ? productoOrigen.getId() : null);
        dto.setProductoOrigenNombre(productoOrigen != null ? productoOrigen.getNombre() : null);
        dto.setAsignadoAId(asignadoA != null ? asignadoA.getId() : null);
        dto.setAsignadoANombre(asignadoA != null ? asignadoA.getNombre() : null);
        dto.setEstado(estado);
        dto.setCreatedBy(creador != null ? creador.getId() : null);
        dto.setCreatedByName(creador != null ? creador.getNombre() : null);
        dto.setApprovedBy(aprobador != null ? aprobador.getId() : null);
        dto.setApprovedByName(aprobador != null ? aprobador.getNombre() : null);
        dto.setApprovedAt(approvedAt);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

