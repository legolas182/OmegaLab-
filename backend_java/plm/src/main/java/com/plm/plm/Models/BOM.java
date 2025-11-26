package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.dto.BOMDTO;
import com.plm.plm.dto.BOMItemDTO;
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
@Table(name = "boms",
    indexes = {
        @Index(name = "idx_producto_id", columnList = "producto_id"),
        @Index(name = "idx_estado", columnList = "estado"),
        @Index(name = "idx_version", columnList = "version")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_producto_version", columnNames = {"producto_id", "version"})
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BOM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bom_producto"))
    private Product producto;

    @Column(nullable = false, length = 20)
    private String version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoBOM estado = EstadoBOM.BORRADOR;

    @Column(columnDefinition = "TEXT")
    private String justificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_bom_creador"))
    private User creador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", foreignKey = @ForeignKey(name = "fk_bom_aprobador"))
    private User aprobador;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "bom", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("secuencia ASC")
    private List<BOMItem> items = new ArrayList<>();

    public BOMDTO getDTO() {
        BOMDTO dto = new BOMDTO();
        dto.setId(id);
        dto.setProductoId(producto != null ? producto.getId() : null);
        dto.setVersion(version);
        dto.setEstado(estado);
        dto.setJustificacion(justificacion);
        dto.setCreatedBy(creador != null ? creador.getId() : null);
        dto.setApprovedBy(aprobador != null ? aprobador.getId() : null);
        dto.setApprovedAt(approvedAt);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);

        if (items != null) {
            List<BOMItemDTO> itemsDTO = items.stream()
                .map(BOMItem::getDTO)
                .collect(Collectors.toList());
            dto.setItems(itemsDTO);
        }

        return dto;
    }
}

