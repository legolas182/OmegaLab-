package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.dto.LoteDTO;
import com.plm.plm.dto.OrdenDetalleDTO;
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

    @GetMapping("/ordenes/{id}/detalle")
    public ResponseEntity<Map<String, Object>> getOrdenDetalle(@PathVariable Integer id) {
        OrdenDetalleDTO detalle = produccionService.getOrdenDetalle(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, OrdenDetalleDTO> data = new HashMap<>();
        data.put("detalle", detalle);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ordenes/{id}/generar-lote")
    public ResponseEntity<Map<String, Object>> generarLote(
            @PathVariable Integer id,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        LoteDTO lote = produccionService.generarLote(id, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, LoteDTO> data = new HashMap<>();
        data.put("lote", lote);
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
