package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.dto.MaterialDTO;
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

@Entity
@Table(name = "materiales",
    indexes = {
        @Index(name = "idx_codigo", columnList = "codigo"),
        @Index(name = "idx_categoria_id", columnList = "categoria_id"),
        @Index(name = "idx_estado", columnList = "estado")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_codigo", columnNames = "codigo")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", foreignKey = @ForeignKey(name = "fk_material_categoria"))
    private Category categoriaEntity;

    @Column(name = "unidad_medida", nullable = false, length = 50)
    private String unidadMedida = "kg";

    @Column(name = "cantidad_stock", precision = 15, scale = 4)
    private BigDecimal cantidadStock = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "material", fetch = FetchType.LAZY)
    private List<BOMItem> usadoEnBOMs = new ArrayList<>();

    public String getCategoriaNombre() {
        return categoriaEntity != null ? categoriaEntity.getNombre() : null;
    }

    public MaterialDTO getDTO() {
        MaterialDTO dto = new MaterialDTO();
        dto.setId(id);
        dto.setCodigo(codigo);
        dto.setNombre(nombre);
        dto.setDescripcion(descripcion);
        dto.setCategoriaId(categoriaEntity != null ? categoriaEntity.getId() : null);
        
        // Determinar el tipo basado en la categoría
        if (categoriaEntity != null && categoriaEntity.getTipoProducto() != null) {
            String tipoProducto = categoriaEntity.getTipoProducto().name();
            // Si la categoría es MATERIA_PRIMA, el material es MATERIA_PRIMA
            // Si la categoría es COMPONENTE, el material es COMPONENTE
            // Si la categoría es PRODUCTO_TERMINADO, no debería estar aquí, pero por seguridad
            if (tipoProducto.equals("MATERIA_PRIMA")) {
                dto.setTipo("MATERIA_PRIMA");
            } else if (tipoProducto.equals("COMPONENTE")) {
                dto.setTipo("COMPONENTE");
            } else {
                dto.setTipo("MATERIA_PRIMA"); // Por defecto
            }
        } else {
            dto.setTipo("MATERIA_PRIMA"); // Por defecto si no tiene categoría
        }
        
        dto.setUnidadMedida(unidadMedida);
        dto.setCantidadStock(cantidadStock);
        dto.setEstado(estado);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

