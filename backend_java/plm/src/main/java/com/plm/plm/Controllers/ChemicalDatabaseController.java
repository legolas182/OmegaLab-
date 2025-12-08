package com.plm.plm.Controllers;

import com.plm.plm.dto.ChemicalCompoundDTO;
import com.plm.plm.services.ChemicalDatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chemical")
public class ChemicalDatabaseController {

    @Autowired
    private ChemicalDatabaseService chemicalDatabaseService;

    @GetMapping("/search/pubchem")
    public ResponseEntity<Map<String, Object>> searchPubChem(
            @RequestParam String query,
            @RequestParam(defaultValue = "NAME") ChemicalDatabaseService.SearchType type) {
        
        List<ChemicalCompoundDTO> results = chemicalDatabaseService.searchPubChem(query, type);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("compounds", results);
        data.put("source", "PubChem");
        data.put("count", results.size());
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/chembl")
    public ResponseEntity<Map<String, Object>> searchChEMBL(
            @RequestParam String query,
            @RequestParam(defaultValue = "NAME") ChemicalDatabaseService.SearchType type) {
        
        List<ChemicalCompoundDTO> results = chemicalDatabaseService.searchChEMBL(query, type);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("compounds", results);
        data.put("source", "ChEMBL");
        data.put("count", results.size());
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/all")
    public ResponseEntity<Map<String, Object>> searchAll(
            @RequestParam String query,
            @RequestParam(defaultValue = "NAME") ChemicalDatabaseService.SearchType type) {
        
        Map<String, List<ChemicalCompoundDTO>> results = chemicalDatabaseService.searchAll(query, type);
        
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("results", results);
        int totalCount = results.values().stream().mapToInt(List::size).sum();
        data.put("totalCount", totalCount);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }
}

