package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.dto.FormulaDTO;
import com.plm.plm.dto.FormulaIngredientDTO;
import com.plm.plm.dto.FormulaVersionDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.FormulaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formulas")
public class FormulaController {

    @Autowired
    private FormulaService formulaService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/create-from-materials")
    public ResponseEntity<Map<String, Object>> createFormulaFromMaterials(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        String nombre = (String) request.get("nombre");
        String objetivo = (String) request.get("objetivo");
        Double rendimiento = request.get("rendimiento") != null ? 
            ((Number) request.get("rendimiento")).doubleValue() : 100.0;
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ingredientesData = (List<Map<String, Object>>) request.get("ingredientes");
        
        List<FormulaIngredientDTO> ingredientes = ingredientesData.stream()
            .map(this::mapToIngredientDTO)
            .toList();
        
        FormulaDTO formula = formulaService.createFormulaFromMaterials(
            nombre, objetivo, rendimiento, ingredientes, userId);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/create-variant")
    public ResponseEntity<Map<String, Object>> createVariant(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        String version = (String) request.get("version");
        String justificacion = (String) request.get("justificacion");
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ingredientesData = (List<Map<String, Object>>) request.get("ingredientes");
        
        List<FormulaIngredientDTO> ingredientes = ingredientesData.stream()
            .map(this::mapToIngredientDTO)
            .toList();
        
        FormulaDTO formula = formulaService.createVariant(id, version, justificacion, ingredientes, userId);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllFormulas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String search) {
        
        List<FormulaDTO> formulas = formulaService.getAllFormulas(estado, search);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, List<FormulaDTO>> data = new HashMap<>();
        data.put("formulas", formulas);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFormulaById(@PathVariable Integer id) {
        FormulaDTO formula = formulaService.getFormulaById(id);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<Map<String, Object>> getFormulaVersions(@PathVariable Integer id) {
        List<FormulaVersionDTO> versions = formulaService.getFormulaVersions(id);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, List<FormulaVersionDTO>> data = new HashMap<>();
        data.put("versions", versions);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFormula(
            @PathVariable Integer id,
            @RequestBody FormulaDTO formulaDTO) {
        
        FormulaDTO formula = formulaService.updateFormula(id, formulaDTO);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/change-estado")
    public ResponseEntity<Map<String, Object>> changeEstado(
            @PathVariable Integer id,
            @RequestParam String nuevoEstado,
            HttpServletRequest request) {
        
        Integer userId = getUserIdFromRequest(request);
        FormulaDTO formula = formulaService.changeEstado(id, nuevoEstado, userId);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validateFormula(@PathVariable Integer id) {
        FormulaDTO formula = formulaService.getFormulaById(id);
        Map<String, Object> validation = formulaService.validateFormula(formula);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", validation);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFormula(@PathVariable Integer id) {
        formulaService.deleteFormula(id);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();
        data.put("message", "Fórmula eliminada correctamente");
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    // Métodos auxiliares privados
    private FormulaIngredientDTO mapToIngredientDTO(Map<String, Object> data) {
        FormulaIngredientDTO dto = new FormulaIngredientDTO();
        
        if (data.get("materialId") != null) {
            dto.setMaterialId(((Number) data.get("materialId")).intValue());
        }
        if (data.get("compoundId") != null) {
            dto.setCompoundId(((Number) data.get("compoundId")).intValue());
        }
        dto.setNombre((String) data.get("nombre"));
        if (data.get("cantidad") != null) {
            dto.setCantidad(((Number) data.get("cantidad")).doubleValue());
        }
        dto.setUnidad((String) data.get("unidad"));
        if (data.get("porcentaje") != null) {
            dto.setPorcentaje(((Number) data.get("porcentaje")).doubleValue());
        }
        dto.setFuncion((String) data.get("funcion"));
        if (data.get("secuencia") != null) {
            dto.setSecuencia(((Number) data.get("secuencia")).intValue());
        }
        
        return dto;
    }

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getUserIdFromToken(token);
        }
        throw new UnauthorizedException("Token de autenticación no encontrado");
    }
}

