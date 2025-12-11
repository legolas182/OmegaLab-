package com.plm.plm.Models;

import com.plm.plm.dto.LoteDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "lotes",
    indexes = {
        @Index(name = "idx_orden_id", columnList = "orden_id"),
        @Index(name = "idx_codigo", columnList = "codigo")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_lote_codigo", columnNames = "codigo")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_lote_orden"))
    private OrdenProduccion orden;

    @Column(name = "fecha_produccion", nullable = false)
    private LocalDateTime fechaProduccion;

    @Column(nullable = false, length = 20)
    private String estado = "EN_PROCESO";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("fecha ASC, hora ASC")
    private List<LoteEvento> eventos = new ArrayList<>();

    public LoteDTO getDTO() {
        LoteDTO dto = new LoteDTO();
        dto.setId(id);
        dto.setCodigo(codigo);
        dto.setOrdenId(orden != null ? orden.getId() : null);
        dto.setOrdenCodigo(orden != null ? orden.getCodigo() : null);
        dto.setProductoNombre(orden != null && orden.getIdea() != null ? orden.getIdea().getTitulo() : null);
        dto.setFechaProduccion(fechaProduccion);
        dto.setEstado(estado);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        
        if (eventos != null) {
            dto.setEventos(eventos.stream()
                .map(LoteEvento::getDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}

