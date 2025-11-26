package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoPrueba;
import com.plm.plm.Models.Prueba;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PruebaRepository extends JpaRepository<Prueba, Integer> {
    List<Prueba> findByIdeaId(Integer ideaId);
    List<Prueba> findByAnalistaId(Integer analistaId);
    List<Prueba> findByAnalistaIdAndEstado(Integer analistaId, EstadoPrueba estado);
    List<Prueba> findByIdeaIdAndEstado(Integer ideaId, EstadoPrueba estado);
}

