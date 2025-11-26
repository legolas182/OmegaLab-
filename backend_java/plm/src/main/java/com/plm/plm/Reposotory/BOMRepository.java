package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.Models.BOM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BOMRepository extends JpaRepository<BOM, Integer> {
    
    List<BOM> findByProductoId(Integer productoId);
    
    List<BOM> findByProductoIdAndEstado(Integer productoId, EstadoBOM estado);
    
    List<BOM> findByProductoIdOrderByVersionDesc(Integer productoId);
    
    boolean existsByProductoIdAndVersion(Integer productoId, String version);
    
    Optional<BOM> findFirstByProductoIdAndEstadoOrderByVersionDesc(Integer productoId, EstadoBOM estado);
}

