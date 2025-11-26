package com.plm.plm.Reposotory;

import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.Models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    Optional<Category> findByNombre(String nombre);
    
    boolean existsByNombre(String nombre);
    
    List<Category> findByTipoProductoAndEstado(TipoProducto tipoProducto, EstadoUsuario estado);
    
    List<Category> findByEstado(EstadoUsuario estado);
}

