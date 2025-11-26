package com.plm.plm.services;

import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    List<CategoryDTO> getAllCategories();
<<<<<<< HEAD
    List<CategoryDTO> getAllCategoriesForAdmin();
=======
>>>>>>> origin/main
    List<CategoryDTO> getCategoriesByTipoProducto(TipoProducto tipoProducto);
    CategoryDTO getCategoryById(Integer id);
    CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO);
    void deleteCategory(Integer id);
}

