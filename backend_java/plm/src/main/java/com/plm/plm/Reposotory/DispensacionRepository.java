package com.plm.plm.Reposotory;

import com.plm.plm.Models.Dispensacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DispensacionRepository extends JpaRepository<Dispensacion, Integer> {
    Optional<Dispensacion> findByOrdenId(Integer ordenId);
}

