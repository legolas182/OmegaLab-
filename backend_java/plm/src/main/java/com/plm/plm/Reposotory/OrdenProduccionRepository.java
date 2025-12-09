package com.plm.plm.Reposotory;

import com.plm.plm.Models.OrdenProduccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenProduccionRepository extends JpaRepository<OrdenProduccion, Integer> {
    List<OrdenProduccion> findByIdeaId(Integer ideaId);
    Optional<OrdenProduccion> findByCodigo(String codigo);
    List<OrdenProduccion> findByEstado(String estado);
}

