package com.plm.plm.Controllers;

import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.Models.BOM;
import com.plm.plm.Models.BOMItem;
import com.plm.plm.Models.Product;
import com.plm.plm.Reposotory.BOMItemRepository;
import com.plm.plm.Reposotory.BOMRepository;
import com.plm.plm.Reposotory.ProductRepository;
import com.plm.plm.Reposotory.MaterialRepository;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.dto.IdeaDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.IdeaService;
import com.plm.plm.services.OpenAIService;
import com.plm.plm.services.UserService;
import com.plm.plm.Enums.Rol;
import com.plm.plm.dto.UserDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    @Autowired
    private IdeaService ideaService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private OpenAIService openAIService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BOMRepository bomRepository;

    @Autowired
    private BOMItemRepository bomItemRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createIdea(
            @RequestBody IdeaDTO ideaDTO,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        IdeaDTO idea = ideaService.createIdea(ideaDTO, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/generate-from-product")
    public ResponseEntity<Map<String, Object>> generateIdeasFromProduct(
            @RequestParam Integer productoId,
            @RequestParam String objetivo,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        
        try {
            // Obtener el producto
            Product product = productRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));
            
            // Obtener el BOM aprobado del producto
            Optional<BOM> bomOpt = bomRepository.findFirstByProductoIdAndEstadoOrderByVersionDesc(
                    productoId, EstadoBOM.APROBADO);
            
            BOM bom = bomOpt.orElse(null);
            List<BOMItem> bomItems = null;
            
            if (bom != null) {
                bomItems = bomItemRepository.findByBomIdOrderBySecuenciaAsc(bom.getId());
            }
            
            // Obtener inventario de materiales disponibles
            List<com.plm.plm.Models.Material> materialesDisponibles = materialRepository.findByEstado(EstadoUsuario.ACTIVO);
            System.out.println("CONTROLLER: Materiales disponibles en inventario: " + materialesDisponibles.size());
            
            // Llamar a la API de OpenAI
            System.out.println("==========================================");
            System.out.println("CONTROLLER: Llamando a OpenAI Service");
            System.out.println("==========================================");
            String aiResponse = openAIService.generateIdeaFromProduct(product, objetivo, bom, bomItems, materialesDisponibles);
            System.out.println("CONTROLLER: Respuesta recibida de OpenAI. Longitud: " + 
                (aiResponse != null ? aiResponse.length() : 0) + " caracteres");
            
            // Parsear la respuesta JSON de OpenAI
            IdeaDTO ideaDTO = parseAIResponse(aiResponse, productoId, objetivo, product);
            System.out.println("CONTROLLER: IdeaDTO parseado. Título: " + ideaDTO.getTitulo());
            
            // Crear la idea
            IdeaDTO idea = ideaService.createIdea(ideaDTO, userId);
            
            Map<String, Object> response = new HashMap<>();
            Map<String, IdeaDTO> data = new HashMap<>();
            data.put("idea", idea);
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            System.err.println("Error al generar idea con IA: " + e.getMessage());
            e.printStackTrace();
            
            // Si falla la IA, crear una idea básica
            IdeaDTO ideaDTO = new IdeaDTO();
            ideaDTO.setProductoOrigenId(productoId);
            ideaDTO.setObjetivo(objetivo);
            ideaDTO.setTitulo("Nueva fórmula generada por IA - " + objetivo);
            ideaDTO.setDescripcion("Fórmula generada automáticamente por IA basada en el producto seleccionado y el objetivo especificado. " +
                    "Nota: Hubo un problema al procesar con IA, se creó una idea básica.");
            // Buscar categoría por nombre o usar null si no existe
            categoryRepository.findByNombre("Nutracéutico").ifPresent(cat -> ideaDTO.setCategoriaId(cat.getId()));
            ideaDTO.setPrioridad("Alta");
            
            IdeaDTO idea = ideaService.createIdea(ideaDTO, userId);
            Map<String, Object> response = new HashMap<>();
            Map<String, IdeaDTO> data = new HashMap<>();
            data.put("idea", idea);
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
    }

    private IdeaDTO parseAIResponse(String aiResponse, Integer productoId, String objetivo, Product product) {
        System.out.println("==========================================");
        System.out.println("PARSING AI RESPONSE");
        System.out.println("==========================================");
        System.out.println("Respuesta completa (primeros 500 caracteres): " + 
            (aiResponse != null ? aiResponse.substring(0, Math.min(500, aiResponse.length())) : "null"));
        
        IdeaDTO ideaDTO = new IdeaDTO();
        ideaDTO.setProductoOrigenId(productoId);
        ideaDTO.setObjetivo(objetivo);
        // Si el producto tiene categoría, usar su ID, sino buscar "Nutracéutico"
        if (product.getCategoriaEntity() != null) {
            ideaDTO.setCategoriaId(product.getCategoriaEntity().getId());
        } else {
            categoryRepository.findByNombre("Nutracéutico").ifPresent(cat -> ideaDTO.setCategoriaId(cat.getId()));
        }
        ideaDTO.setPrioridad("Alta");
        
        try {
            // Limpiar la respuesta si tiene markdown code blocks
            String cleanedResponse = aiResponse;
            if (cleanedResponse.contains("```json")) {
                cleanedResponse = cleanedResponse.substring(cleanedResponse.indexOf("```json") + 7);
                if (cleanedResponse.contains("```")) {
                    cleanedResponse = cleanedResponse.substring(0, cleanedResponse.indexOf("```"));
                }
            } else if (cleanedResponse.contains("```")) {
                cleanedResponse = cleanedResponse.replace("```", "");
            }
            cleanedResponse = cleanedResponse.trim();
            
            System.out.println("Respuesta limpiada. Intentando parsear JSON...");
            
            // Intentar parsear como JSON
            JsonNode jsonNode = objectMapper.readTree(cleanedResponse);
            System.out.println("JSON parseado exitosamente. Keys: " + jsonNode.fieldNames());
            
            if (jsonNode.has("titulo")) {
                ideaDTO.setTitulo(jsonNode.get("titulo").asText());
                System.out.println("Título extraído: " + ideaDTO.getTitulo());
            } else {
                ideaDTO.setTitulo("Nueva fórmula generada por IA - " + objetivo);
            }
            
            if (jsonNode.has("descripcion")) {
                ideaDTO.setDescripcion(jsonNode.get("descripcion").asText());
                System.out.println("Descripción extraída (longitud): " + ideaDTO.getDescripcion().length());
            } else {
                ideaDTO.setDescripcion(aiResponse);
            }
            
            // Guardar la respuesta completa de la IA en detallesIA
            ideaDTO.setDetallesIA(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode));
            System.out.println("Detalles IA guardados (longitud): " + ideaDTO.getDetallesIA().length());
            
            // Extraer pruebasRequeridas si existe
            if (jsonNode.has("pruebasRequeridas")) {
                ideaDTO.setPruebasRequeridas(jsonNode.get("pruebasRequeridas").asText());
                System.out.println("Pruebas requeridas extraídas (longitud): " + ideaDTO.getPruebasRequeridas().length());
            }
            
        } catch (Exception e) {
            // Si no es JSON válido, usar la respuesta completa como descripción
            System.out.println("ERROR: La respuesta de IA no es JSON válido: " + e.getMessage());
            System.out.println("Usando respuesta completa como texto");
            ideaDTO.setTitulo("Nueva fórmula generada por IA - " + objetivo);
            ideaDTO.setDescripcion(aiResponse);
            ideaDTO.setDetallesIA(aiResponse); // Guardar la respuesta completa
        }
        
        System.out.println("==========================================");
        return ideaDTO;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllIdeas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) String search) {
        EstadoIdea estadoEnum = null;
        if (estado != null && !estado.isEmpty()) {
            try {
                estadoEnum = EstadoIdea.fromString(estado);
            } catch (IllegalArgumentException e) {
                // Si el estado no es válido, se ignora
            }
        }
        
        // Convertir categoria (puede ser ID o nombre) a categoriaId
        Integer categoriaId = null;
        if (categoria != null && !categoria.trim().isEmpty()) {
            try {
                categoriaId = Integer.parseInt(categoria);
            } catch (NumberFormatException e) {
                categoriaId = categoryRepository.findByNombre(categoria)
                        .map(cat -> cat.getId())
                        .orElse(null);
            }
        }
        
        List<IdeaDTO> ideas = ideaService.getAllIdeas(estadoEnum, categoriaId, prioridad, search);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<IdeaDTO>> data = new HashMap<>();
        data.put("ideas", ideas);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getIdeaById(@PathVariable Integer id) {
        IdeaDTO idea = ideaService.getIdeaById(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateIdea(
            @PathVariable Integer id,
            @RequestBody IdeaDTO ideaDTO) {
        IdeaDTO idea = ideaService.updateIdea(id, ideaDTO);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteIdea(@PathVariable Integer id) {
        ideaService.deleteIdea(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();
        data.put("message", "Idea eliminada correctamente");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveIdea(
            @PathVariable Integer id,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        IdeaDTO idea = ideaService.approveIdea(id, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectIdea(
            @PathVariable Integer id,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        IdeaDTO idea = ideaService.rejectIdea(id, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analistas")
    public ResponseEntity<Map<String, Object>> getAnalistas() {
        List<UserDTO> analistas = userService.getUsersByRol(Rol.ANALISTA_LABORATORIO);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<UserDTO>> data = new HashMap<>();
        data.put("analistas", analistas);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supervisores-calidad")
    public ResponseEntity<Map<String, Object>> getSupervisoresCalidad() {
        List<UserDTO> supervisores = userService.getUsersByRol(Rol.SUPERVISOR_CALIDAD);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<UserDTO>> data = new HashMap<>();
        data.put("supervisores", supervisores);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mis-ideas")
    public ResponseEntity<Map<String, Object>> getMisIdeas(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        List<IdeaDTO> ideas = ideaService.getIdeasAsignadas(userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<IdeaDTO>> data = new HashMap<>();
        data.put("ideas", ideas);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/change-estado")
    public ResponseEntity<Map<String, Object>> changeEstado(
            @PathVariable Integer id,
            @RequestParam String nuevoEstado,
            @RequestParam(required = false) Integer analistaId,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        EstadoIdea estadoEnum = EstadoIdea.fromString(nuevoEstado);
        IdeaDTO idea = ideaService.changeEstado(id, estadoEnum, userId, analistaId);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/confirmar-produccion")
    public ResponseEntity<Map<String, Object>> confirmarProduccion(
            @PathVariable Integer id,
            @RequestParam Integer supervisorCalidadId,
            @RequestParam Integer cantidad,
            HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        IdeaDTO idea = ideaService.confirmarProduccion(id, supervisorCalidadId, cantidad, userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, IdeaDTO> data = new HashMap<>();
        data.put("idea", idea);
        response.put("data", data);
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

