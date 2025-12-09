package com.plm.plm.Controllers;

import com.plm.plm.dto.LoteDTO;
import com.plm.plm.Reposotory.LoteRepository;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    @Autowired
    private LoteRepository loteRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLotes() {
        List<LoteDTO> lotes = loteRepository.findAll().stream()
                .map(lote -> {
                    lote.getEventos().size();
                    return lote.getDTO();
                })
                .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        Map<String, List<LoteDTO>> data = new HashMap<>();
        data.put("lotes", lotes);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Map<String, Object>> getLoteByCodigo(@PathVariable String codigo) {
        com.plm.plm.Models.Lote lote = loteRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado"));
        
        lote.getEventos().size();
        LoteDTO loteDTO = lote.getDTO();
        
        Map<String, Object> response = new HashMap<>();
        Map<String, LoteDTO> data = new HashMap<>();
        data.put("lote", loteDTO);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}

