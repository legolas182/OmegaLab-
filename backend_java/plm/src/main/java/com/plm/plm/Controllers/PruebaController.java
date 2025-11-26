package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.dto.PruebaDTO;
import com.plm.plm.dto.ResultadoPruebaDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.PruebaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pruebas")
public class PruebaController {

    @Autowired
    private PruebaService pruebaService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPrueba(
            @RequestBody PruebaDTO pruebaDTO,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        PruebaDTO prueba = pruebaService.createPrueba(pruebaDTO, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, PruebaDTO> data = new HashMap<>();
        data.put("prueba", prueba);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPruebaById(@PathVariable Integer id) {
        PruebaDTO prueba = pruebaService.getPruebaById(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, PruebaDTO> data = new HashMap<>();
        data.put("prueba", prueba);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<Map<String, Object>> getPruebasByIdeaId(@PathVariable Integer ideaId) {
        List<PruebaDTO> pruebas = pruebaService.getPruebasByIdeaId(ideaId);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<PruebaDTO>> data = new HashMap<>();
        data.put("pruebas", pruebas);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mis-pruebas")
    public ResponseEntity<Map<String, Object>> getMisPruebas(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        List<PruebaDTO> pruebas = pruebaService.getPruebasByAnalistaId(userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<PruebaDTO>> data = new HashMap<>();
        data.put("pruebas", pruebas);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePrueba(
            @PathVariable Integer id,
            @RequestBody PruebaDTO pruebaDTO) {
        PruebaDTO prueba = pruebaService.updatePrueba(id, pruebaDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, PruebaDTO> data = new HashMap<>();
        data.put("prueba", prueba);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resultados")
    public ResponseEntity<Map<String, Object>> addResultado(
            @PathVariable Integer id,
            @RequestBody ResultadoPruebaDTO resultadoDTO) {
        PruebaDTO prueba = pruebaService.addResultado(id, resultadoDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, PruebaDTO> data = new HashMap<>();
        data.put("prueba", prueba);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePrueba(@PathVariable Integer id) {
        pruebaService.deletePrueba(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Prueba eliminada exitosamente");
        return ResponseEntity.ok(response);
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

