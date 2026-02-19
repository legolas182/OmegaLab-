package com.plm.plm.Controllers;

import com.plm.plm.dto.FormulaDTO;
import com.plm.plm.dto.FormulaVersionDTO;
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
    private com.plm.plm.security.JwtTokenProvider jwtTokenProvider;

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
    public ResponseEntity<Map<String, Object>> getFormulaById(
            @PathVariable Integer id) {
        FormulaDTO formula = formulaService.getFormulaById(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<Map<String, Object>> getFormulaVersions(
            @PathVariable Integer id) {
        List<FormulaVersionDTO> versions = formulaService.getFormulaVersions(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<FormulaVersionDTO>> data = new HashMap<>();
        data.put("versions", versions);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFormula(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        Integer userId = getUserIdFromRequest(httpRequest);
        
        String nombre = (String) request.get("nombre");
        String objetivo = (String) request.get("objetivo");
        Double rendimiento = request.get("rendimiento") != null ? 
            ((Number) request.get("rendimiento")).doubleValue() : null;
        
        @SuppressWarnings("unchecked")
        List<com.plm.plm.dto.FormulaIngredientDTO> ingredientes = 
            (List<com.plm.plm.dto.FormulaIngredientDTO>) request.get("ingredientes");
        
        FormulaDTO formula = formulaService.createFormulaFromMaterials(
            nombre, objetivo, rendimiento, ingredientes, userId);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFormula(@PathVariable Integer id) {
        formulaService.deleteFormula(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();
        data.put("message", "Fórmula eliminada correctamente");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validateFormula(
            @PathVariable Integer id) {
        FormulaDTO formula = formulaService.getFormulaById(id);
        Map<String, Object> validation = formulaService.validateFormula(formula);
        Map<String, Object> response = new HashMap<>();
        response.put("data", validation);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/variants")
    public ResponseEntity<Map<String, Object>> createVariant(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        Integer userId = getUserIdFromRequest(httpRequest);
        
        String version = (String) request.get("version");
        String justificacion = (String) request.get("justificacion");
        
        @SuppressWarnings("unchecked")
        List<com.plm.plm.dto.FormulaIngredientDTO> ingredientes = 
            (List<com.plm.plm.dto.FormulaIngredientDTO>) request.get("ingredientes");
        
        FormulaDTO formula = formulaService.createVariant(
            id, version, justificacion, ingredientes, userId);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getUserIdFromToken(token);
        }
        throw new com.plm.plm.Config.exception.UnauthorizedException("Token de autenticación no encontrado");
    }
}
