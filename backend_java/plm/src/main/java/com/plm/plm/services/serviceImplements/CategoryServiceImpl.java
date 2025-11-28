package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.Exception.DuplicateResourceException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.Models.Category;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.dto.CategoryDTO;
import com.plm.plm.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        validateCategoryData(categoryDTO.getNombre(), categoryDTO.getTipoProducto());

        if (categoryDTO.getNombre() != null && categoryRepository.existsByNombre(categoryDTO.getNombre())) {
            throw new DuplicateResourceException("La categoría con ese nombre ya existe");
        }

        Category category = new Category();
        category.setNombre(categoryDTO.getNombre());
        category.setDescripcion(categoryDTO.getDescripcion() != null ? categoryDTO.getDescripcion() : "");
        category.setTipoProducto(categoryDTO.getTipoProducto());
        category.setEstado(categoryDTO.getEstado() != null ? categoryDTO.getEstado() : EstadoUsuario.ACTIVO);

        return categoryRepository.save(category).getDTO();
    }

    private void validateCategoryData(String nombre, TipoProducto tipoProducto) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BadRequestException("El nombre de la categoría es requerido");
        }

        if (tipoProducto == null) {
            throw new BadRequestException("El tipo de producto es requerido");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByEstado(EstadoUsuario.ACTIVO)
                .stream()
                .map(Category::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategoriesForAdmin() {
        return categoryRepository.findAll()
                .stream()
                .map(Category::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesByTipoProducto(TipoProducto tipoProducto) {
        return categoryRepository.findByTipoProductoAndEstado(tipoProducto, EstadoUsuario.ACTIVO)
                .stream()
                .map(Category::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        
        return category.getDTO();
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        // Validar que el nombre no esté duplicado (excluyendo la categoría actual)
        if (categoryDTO.getNombre() != null && !categoryDTO.getNombre().equals(category.getNombre())) {
            if (categoryRepository.existsByNombre(categoryDTO.getNombre())) {
                throw new DuplicateResourceException("La categoría con ese nombre ya existe");
            }
        }

        // Validar datos básicos
        validateCategoryData(categoryDTO.getNombre(), categoryDTO.getTipoProducto());

        category.setNombre(categoryDTO.getNombre());
        category.setDescripcion(categoryDTO.getDescripcion() != null ? categoryDTO.getDescripcion() : "");
        category.setTipoProducto(categoryDTO.getTipoProducto());

        if (categoryDTO.getEstado() != null) {
            category.setEstado(categoryDTO.getEstado());
        }

        return categoryRepository.save(category).getDTO();
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        category.setEstado(EstadoUsuario.INACTIVO);
        categoryRepository.save(category);
    }
}

