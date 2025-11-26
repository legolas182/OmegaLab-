package com.plm.plm.Models;

import com.plm.plm.Enums.EstadoPrueba;
import com.plm.plm.dto.PruebaDTO;
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
@Table(name = "pruebas",
    indexes = {
        @Index(name = "idx_idea_id", columnList = "idea_id"),
        @Index(name = "idx_analista_id", columnList = "analista_id"),
        @Index(name = "idx_estado", columnList = "estado")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prueba {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false, foreignKey = @ForeignKey(name = "fk_prueba_idea"))
    private Idea idea;

    @Column(name = "codigo_muestra", nullable = false, length = 100)
    private String codigoMuestra;

    @Column(name = "tipo_prueba", nullable = false, length = 100)
    private String tipoPrueba;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPrueba estado = EstadoPrueba.PENDIENTE;

    @Column(name = "fecha_muestreo")
    private LocalDateTime fechaMuestreo;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "equipos_utilizados", columnDefinition = "TEXT")
    private String equiposUtilizados;

    @Column(name = "pruebas_requeridas", columnDefinition = "TEXT")
    private String pruebasRequeridas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analista_id", nullable = false, foreignKey = @ForeignKey(name = "fk_prueba_analista"))
    private User analista;

    @OneToMany(mappedBy = "prueba", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResultadoPrueba> resultados = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PruebaDTO getDTO() {
        PruebaDTO dto = new PruebaDTO();
        dto.setId(id);
        dto.setIdeaId(idea != null ? idea.getId() : null);
        dto.setIdeaTitulo(idea != null ? idea.getTitulo() : null);
        dto.setIdeaEstado(idea != null && idea.getEstado() != null ? idea.getEstado().name() : null);
        dto.setCodigoMuestra(codigoMuestra);
        dto.setTipoPrueba(tipoPrueba);
        dto.setDescripcion(descripcion);
        dto.setEstado(estado);
        dto.setFechaMuestreo(fechaMuestreo);
        dto.setFechaInicio(fechaInicio);
        dto.setFechaFin(fechaFin);
        dto.setResultado(resultado);
        dto.setObservaciones(observaciones);
        dto.setEquiposUtilizados(equiposUtilizados);
        dto.setPruebasRequeridas(pruebasRequeridas);
        dto.setAnalistaId(analista != null ? analista.getId() : null);
        dto.setAnalistaNombre(analista != null ? analista.getNombre() : null);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        
        if (resultados != null && !resultados.isEmpty()) {
            dto.setResultados(resultados.stream().map(ResultadoPrueba::getDTO).toList());
        }
        
        return dto;
    }
}

