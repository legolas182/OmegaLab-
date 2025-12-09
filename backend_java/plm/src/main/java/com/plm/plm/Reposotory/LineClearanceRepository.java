package com.plm.plm.Reposotory;

import com.plm.plm.Models.LineClearance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LineClearanceRepository extends JpaRepository<LineClearance, Integer> {
    Optional<LineClearance> findByOrdenId(Integer ordenId);
}

