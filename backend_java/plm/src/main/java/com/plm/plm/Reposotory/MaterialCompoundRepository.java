package com.plm.plm.Reposotory;

import com.plm.plm.Models.MaterialCompound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialCompoundRepository extends JpaRepository<MaterialCompound, Integer> {
    
    List<MaterialCompound> findByMaterialId(Integer materialId);
    
    List<MaterialCompound> findByTipoCompuesto(String tipoCompuesto);
    
    List<MaterialCompound> findByMaterialIdAndTipoCompuesto(Integer materialId, String tipoCompuesto);
}

