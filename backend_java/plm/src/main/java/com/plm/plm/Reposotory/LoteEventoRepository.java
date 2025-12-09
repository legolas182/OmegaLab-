package com.plm.plm.Reposotory;

import com.plm.plm.Models.LoteEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoteEventoRepository extends JpaRepository<LoteEvento, Integer> {
    List<LoteEvento> findByLoteIdOrderByFechaAscHoraAsc(Integer loteId);
}

