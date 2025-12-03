package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    
    Optional<Product> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
    
    boolean existsByNombre(String nombre);
    
    @Query("SELECT p FROM Product p WHERE p.estado = :estado AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findByNombreOrCodigoContaining(@Param("search") String search, 
                                                   @Param("estado") EstadoUsuario estado);
}

