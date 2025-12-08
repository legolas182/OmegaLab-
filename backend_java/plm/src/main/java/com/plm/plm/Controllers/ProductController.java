package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.dto.BOMDTO;
import com.plm.plm.dto.BOMItemDTO;
import com.plm.plm.dto.ProductDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestBody ProductDTO productDTO) {
        ProductDTO product = productService.createProduct(productDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, ProductDTO> data = new HashMap<>();
        data.put("product", product);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String search) {
        List<ProductDTO> products = productService.getAllProducts(tipo, categoria, search);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<ProductDTO>> data = new HashMap<>();
        data.put("products", products);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Integer id) {
        Map<String, Object> productData = productService.getProductById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("data", productData);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Integer id,
            @RequestBody ProductDTO productDTO) {
        ProductDTO product = productService.updateProduct(id, productDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, ProductDTO> data = new HashMap<>();
        data.put("product", product);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/bom")
    public ResponseEntity<Map<String, Object>> createOrUpdateBOM(
            @PathVariable Integer id,
            @RequestBody BOMDTO bomDTO,
            HttpServletRequest httpRequest) {
        Integer userId = getUserIdFromRequest(httpRequest);
        BOMDTO bom = productService.createOrUpdateBOM(id, bomDTO.getJustificacion(), userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, BOMDTO> data = new HashMap<>();
        data.put("bom", bom);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/bom/history")
    public ResponseEntity<Map<String, Object>> getBOMHistory(
            @PathVariable Integer id) {
        List<BOMDTO> history = productService.getBOMHistory(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<BOMDTO>> data = new HashMap<>();
        data.put("history", history);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/boms/{bomId}/items")
    public ResponseEntity<Map<String, Object>> addMaterialToBOM(
            @PathVariable Integer bomId,
            @RequestBody BOMItemDTO bomItemDTO) {
        BOMItemDTO item = productService.addMaterialToBOM(
            bomId,
            bomItemDTO.getMaterialId(),
            bomItemDTO.getCantidad(),
            bomItemDTO.getUnidad(),
            bomItemDTO.getPorcentaje()
        );
        Map<String, Object> response = new HashMap<>();
        Map<String, BOMItemDTO> data = new HashMap<>();
        data.put("item", item);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/boms/{bomId}")
    public ResponseEntity<Map<String, Object>> getBOMWithItems(
            @PathVariable Integer bomId) {
        BOMDTO bom = productService.getBOMWithItems(bomId);
        Map<String, Object> response = new HashMap<>();
        Map<String, BOMDTO> data = new HashMap<>();
        data.put("bom", bom);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/bom-items/{itemId}")
    public ResponseEntity<Map<String, Object>> updateBOMItem(
            @PathVariable Integer itemId,
            @RequestBody BOMItemDTO bomItemDTO) {
        BOMItemDTO item = productService.updateBOMItem(
            itemId,
            bomItemDTO.getMaterialId(),
            bomItemDTO.getCantidad(),
            bomItemDTO.getUnidad(),
            bomItemDTO.getPorcentaje()
        );
        Map<String, Object> response = new HashMap<>();
        Map<String, BOMItemDTO> data = new HashMap<>();
        data.put("item", item);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/bom-items/{itemId}")
    public ResponseEntity<Map<String, Object>> deleteBOMItem(@PathVariable Integer itemId) {
        productService.deleteBOMItem(itemId);
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();
        data.put("message", "Item eliminado correctamente");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/boms/{bomId}/validar")
    public ResponseEntity<Map<String, Object>> validateBOM(@PathVariable Integer bomId) {
        Map<String, Object> validacion = productService.validateBOM(bomId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", validacion);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/boms/{bomId}/totales")
    public ResponseEntity<Map<String, Object>> calculateBOMTotals(@PathVariable Integer bomId) {
        Map<String, Object> totales = productService.calculateBOMTotals(bomId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", totales);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/verificar-stock")
    public ResponseEntity<Map<String, Object>> verifyStock(
            @PathVariable Integer id,
            @RequestParam BigDecimal cantidad) {
        Map<String, Object> verificacion = productService.verifyStockProduction(id, cantidad);
        Map<String, Object> response = new HashMap<>();
        response.put("data", verificacion);
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

