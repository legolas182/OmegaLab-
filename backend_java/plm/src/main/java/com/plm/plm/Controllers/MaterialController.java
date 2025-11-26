package com.plm.plm.Controllers;

import com.plm.plm.dto.MaterialDTO;
import com.plm.plm.services.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMaterial(
            @RequestBody MaterialDTO materialDTO) {
        MaterialDTO material = materialService.createMaterial(materialDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, MaterialDTO> data = new HashMap<>();
        data.put("material", material);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMaterials(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String search) {
        List<MaterialDTO> materials;

        if (search != null && !search.trim().isEmpty()) {
            materials = materialService.searchMaterials(search.trim());
        } else if (categoria != null && !categoria.isEmpty()) {
            materials = materialService.getMaterialsByCategoria(categoria);
        } else {
            materials = materialService.getAllMaterials();
        }

        Map<String, Object> response = new HashMap<>();
        Map<String, List<MaterialDTO>> data = new HashMap<>();
        data.put("materials", materials);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMaterialById(
            @PathVariable Integer id) {
        MaterialDTO material = materialService.getMaterialById(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, MaterialDTO> data = new HashMap<>();
        data.put("material", material);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMaterial(
            @PathVariable Integer id,
            @RequestBody MaterialDTO materialDTO) {
        MaterialDTO material = materialService.updateMaterial(id, materialDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, MaterialDTO> data = new HashMap<>();
        data.put("material", material);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMaterial(@PathVariable Integer id) {
        materialService.deleteMaterial(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();
        data.put("message", "Material eliminado correctamente");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
