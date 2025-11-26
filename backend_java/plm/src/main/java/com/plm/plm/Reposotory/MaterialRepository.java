package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Models.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Integer> {
    
    Optional<Material> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
    
    List<Material> findByEstado(EstadoUsuario estado);
    
<<<<<<< HEAD
=======
    List<Material> findByCategoriaAndEstado(String categoria, EstadoUsuario estado);
    
>>>>>>> origin/main
    @Query("SELECT m FROM Material m WHERE (m.nombre LIKE %:search% OR m.codigo LIKE %:search%) AND m.estado = :estado")
    List<Material> findByNombreOrCodigoContaining(@Param("search") String search, @Param("estado") EstadoUsuario estado);
}

