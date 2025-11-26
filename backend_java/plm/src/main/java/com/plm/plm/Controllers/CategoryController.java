package com.plm.plm.Controllers;

import com.plm.plm.dto.CategoryDTO;
import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    public ResponseEntity<Map<String, CategoryDTO>> createCategory(
            @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO category = categoryService.createCategory(categoryDTO);
        Map<String, CategoryDTO> data = new HashMap<>();
        data.put("category", category);
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    @GetMapping
    public ResponseEntity<Map<String, List<CategoryDTO>>> getAllCategories(
<<<<<<< HEAD
            @RequestParam(required = false) String tipoProducto,
            @RequestParam(required = false) Boolean all) {
=======
            @RequestParam(required = false) String tipoProducto) {
>>>>>>> origin/main
        List<CategoryDTO> categories;
        
        if (tipoProducto != null && !tipoProducto.isEmpty()) {
            TipoProducto tipo = TipoProducto.fromString(tipoProducto);
            categories = categoryService.getCategoriesByTipoProducto(tipo);
<<<<<<< HEAD
        } else if (all != null && all) {
            categories = categoryService.getAllCategoriesForAdmin();
=======
>>>>>>> origin/main
        } else {
            categories = categoryService.getAllCategories();
        }
        
        Map<String, List<CategoryDTO>> data = new HashMap<>();
        data.put("categories", categories);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, CategoryDTO>> getCategoryById(
            @PathVariable Integer id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        Map<String, CategoryDTO> data = new HashMap<>();
        data.put("category", category);
        return ResponseEntity.ok(data);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, CategoryDTO>> updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO category = categoryService.updateCategory(id, categoryDTO);
        Map<String, CategoryDTO> data = new HashMap<>();
        data.put("category", category);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        Map<String, String> data = new HashMap<>();
        data.put("message", "Categoría eliminada correctamente");
        return ResponseEntity.ok(data);
    }
}

