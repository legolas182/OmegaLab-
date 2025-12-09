package com.plm.plm.Reposotory;

import com.plm.plm.Models.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Integer> {
    Optional<Lote> findByCodigo(String codigo);
    Optional<Lote> findByOrdenId(Integer ordenId);
}

