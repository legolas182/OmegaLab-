package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.dto.CategoryDTO;
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

@Entity
@Table(name = "categorias",
    indexes = {
        @Index(name = "idx_nombre", columnList = "nombre"),
        @Index(name = "idx_tipo_producto", columnList = "tipo_producto"),
        @Index(name = "idx_estado", columnList = "estado")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_nombre", columnNames = "nombre")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_producto", nullable = false, length = 50)
    private TipoProducto tipoProducto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "categoriaEntity", fetch = FetchType.LAZY)
    private List<Product> productos = new ArrayList<>();

    public CategoryDTO getDTO() {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(id);
        dto.setNombre(nombre);
        dto.setDescripcion(descripcion);
        dto.setTipoProducto(tipoProducto);
        dto.setEstado(estado);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

