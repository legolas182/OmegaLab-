package com.plm.plm.Models;

import com.plm.plm.dto.LoteEventoDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "lote_eventos",
    indexes = {
        @Index(name = "idx_lote_id", columnList = "lote_id"),
        @Index(name = "idx_tipo", columnList = "tipo")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoteEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lote_evento_lote"))
    private Lote lote;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, length = 10)
    private String hora;

    @Column(length = 100)
    private String identificador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lote_evento_usuario"))
    private User usuario;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public LoteEventoDTO getDTO() {
        LoteEventoDTO dto = new LoteEventoDTO();
        dto.setId(id);
        dto.setLoteId(lote != null ? lote.getId() : null);
        dto.setTipo(tipo);
        dto.setDescripcion(descripcion);
        dto.setFecha(fecha);
        dto.setHora(hora);
        dto.setIdentificador(identificador);
        dto.setUsuarioId(usuario != null ? usuario.getId() : null);
        dto.setUsuarioNombre(usuario != null ? usuario.getNombre() : null);
        dto.setDetalles(detalles);
        dto.setCreatedAt(createdAt);
        return dto;
    }
}

