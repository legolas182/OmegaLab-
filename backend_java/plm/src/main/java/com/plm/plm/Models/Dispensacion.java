package com.plm.plm.Models;

import com.plm.plm.dto.DispensacionDTO;
import com.plm.plm.dto.DispensacionItemDTO;
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
@Table(name = "dispensaciones",
    indexes = {
        @Index(name = "idx_orden_id", columnList = "orden_id"),
        @Index(name = "idx_completada", columnList = "completada")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dispensacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_dispensacion_orden"))
    private OrdenProduccion orden;

    @Column(nullable = false)
    private Boolean completada = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "realizada_por", nullable = false, foreignKey = @ForeignKey(name = "fk_dispensacion_usuario"))
    private User realizadaPor;

    @Column(name = "equipo_utilizado", length = 100)
    private String equipoUtilizado;

    @Column(name = "fecha_calibracion")
    private LocalDateTime fechaCalibracion;

    @OneToMany(mappedBy = "dispensacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("secuencia ASC")
    private List<DispensacionItem> items = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DispensacionDTO getDTO() {
        DispensacionDTO dto = new DispensacionDTO();
        dto.setId(id);
        dto.setOrdenId(orden != null ? orden.getId() : null);
        dto.setCompletada(completada);
        dto.setRealizadaPorId(realizadaPor != null ? realizadaPor.getId() : null);
        dto.setRealizadaPorNombre(realizadaPor != null ? realizadaPor.getNombre() : null);
        dto.setEquipoUtilizado(equipoUtilizado);
        dto.setFechaCalibracion(fechaCalibracion);
        if (items != null && !items.isEmpty()) {
            dto.setItems(items.stream().map(DispensacionItem::getDTO).collect(Collectors.toList()));
        }
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

