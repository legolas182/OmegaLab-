package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.dto.DispensacionDTO;
import com.plm.plm.dto.LineClearanceDTO;
import com.plm.plm.dto.OrdenProduccionDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.ProduccionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produccion")
public class ProduccionController {

    @Autowired
    private ProduccionService produccionService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/ordenes")
    public ResponseEntity<Map<String, Object>> getOrdenesProduccion() {
        List<OrdenProduccionDTO> ordenes = produccionService.getOrdenesProduccion();
        Map<String, Object> response = new HashMap<>();
        Map<String, List<OrdenProduccionDTO>> data = new HashMap<>();
        data.put("ordenes", ordenes);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ordenes/{id}")
    public ResponseEntity<Map<String, Object>> getOrdenById(@PathVariable Integer id) {
        OrdenProduccionDTO orden = produccionService.getOrdenById(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, OrdenProduccionDTO> data = new HashMap<>();
        data.put("orden", orden);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ordenes/{ordenId}/dispensacion")
    public ResponseEntity<Map<String, Object>> getDispensacionByOrdenId(@PathVariable Integer ordenId) {
        DispensacionDTO dispensacion = produccionService.getDispensacionByOrdenId(ordenId);
        Map<String, Object> response = new HashMap<>();
        Map<String, DispensacionDTO> data = new HashMap<>();
        data.put("dispensacion", dispensacion);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ordenes/{ordenId}/dispensacion")
    public ResponseEntity<Map<String, Object>> saveDispensacion(
            @PathVariable Integer ordenId,
            @RequestBody DispensacionDTO dispensacionDTO,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        DispensacionDTO dispensacion = produccionService.saveDispensacion(ordenId, dispensacionDTO, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, DispensacionDTO> data = new HashMap<>();
        data.put("dispensacion", dispensacion);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/ordenes/{ordenId}/line-clearance")
    public ResponseEntity<Map<String, Object>> getLineClearanceByOrdenId(@PathVariable Integer ordenId) {
        LineClearanceDTO lineClearance = produccionService.getLineClearanceByOrdenId(ordenId);
        Map<String, Object> response = new HashMap<>();
        Map<String, LineClearanceDTO> data = new HashMap<>();
        data.put("lineClearance", lineClearance);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ordenes/{ordenId}/line-clearance")
    public ResponseEntity<Map<String, Object>> saveLineClearance(
            @PathVariable Integer ordenId,
            @RequestBody LineClearanceDTO lineClearanceDTO,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        LineClearanceDTO lineClearance = produccionService.saveLineClearance(ordenId, lineClearanceDTO, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, LineClearanceDTO> data = new HashMap<>();
        data.put("lineClearance", lineClearance);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

