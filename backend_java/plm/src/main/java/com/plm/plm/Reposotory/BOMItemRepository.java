package com.plm.plm.Reposotory;

import com.plm.plm.Models.BOMItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BOMItemRepository extends JpaRepository<BOMItem, Integer> {
    
    List<BOMItem> findByBomId(Integer bomId);
    
    @Query("SELECT bi FROM BOMItem bi JOIN FETCH bi.material WHERE bi.bom.id = :bomId ORDER BY bi.secuencia ASC")
    List<BOMItem> findByBomIdOrderBySecuenciaAsc(@Param("bomId") Integer bomId);
    
    @Query("SELECT COALESCE(MAX(bi.secuencia), 0) FROM BOMItem bi WHERE bi.bom.id = :bomId")
    Integer findMaxSecuenciaByBomId(@Param("bomId") Integer bomId);
}

