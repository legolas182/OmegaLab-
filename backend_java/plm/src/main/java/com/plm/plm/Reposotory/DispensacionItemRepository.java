package com.plm.plm.Reposotory;

import com.plm.plm.Models.DispensacionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispensacionItemRepository extends JpaRepository<DispensacionItem, Integer> {
    List<DispensacionItem> findByDispensacionIdOrderBySecuenciaAsc(Integer dispensacionId);
}

