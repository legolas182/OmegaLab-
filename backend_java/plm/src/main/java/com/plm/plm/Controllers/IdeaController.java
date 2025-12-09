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

    @Autowired
    private com.plm.plm.Reposotory.ChemicalCompoundRepository chemicalCompoundRepository;

    @Autowired
    private com.plm.plm.services.FormulaService formulaService;

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

    @PostMapping("/generate-from-materials")
    public ResponseEntity<Map<String, Object>> generateFormulaFromMaterials(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        Integer userId = getUserIdFromRequest(httpRequest);
        
        try {
            String objetivo = (String) request.get("objetivo");
            @SuppressWarnings("unchecked")
            List<Integer> materialIds = (List<Integer>) request.get("materialIds");
            @SuppressWarnings("unchecked")
            List<Integer> compoundIds = (List<Integer>) request.get("compoundIds");
            
            if (objetivo == null || objetivo.trim().isEmpty()) {
                throw new RuntimeException("El objetivo es requerido");
            }
            
            // Obtener materiales seleccionados
            List<com.plm.plm.Models.Material> materialesSeleccionados = new java.util.ArrayList<>();
            if (materialIds != null) {
                for (Integer materialId : materialIds) {
                    materialRepository.findById(materialId).ifPresent(materialesSeleccionados::add);
                }
            }
            
            // Obtener todos los materiales disponibles
            List<com.plm.plm.Models.Material> materialesDisponibles = materialRepository.findByEstado(EstadoUsuario.ACTIVO);
            
            // Obtener compuestos de BD químicas si hay
            List<com.plm.plm.Models.ChemicalCompound> compounds = new java.util.ArrayList<>();
            if (compoundIds != null && chemicalCompoundRepository != null) {
                for (Integer compoundId : compoundIds) {
                    // Filtrar nulls - los compuestos de APIs externas no tienen ID hasta que se guarden en BD
                    if (compoundId != null) {
                        chemicalCompoundRepository.findById(compoundId).ifPresent(compounds::add);
                    }
                }
            }
            
            // Llamar a OpenAI
            String aiResponse = openAIService.generateFormulaFromMaterials(
                objetivo, materialIds, materialesDisponibles, compounds);
            
            // Parsear respuesta y crear idea/fórmula
            IdeaDTO ideaDTO = parseAIResponseFromMaterials(aiResponse, objetivo, materialIds);
            IdeaDTO idea = ideaService.createIdea(ideaDTO, userId);
            
            Map<String, Object> response = new HashMap<>();
            Map<String, IdeaDTO> data = new HashMap<>();
            data.put("idea", idea);
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            System.err.println("Error al generar fórmula desde materias primas: " + e.getMessage());
            e.printStackTrace();
            
            // Crear idea básica si falla
            IdeaDTO ideaDTO = new IdeaDTO();
            ideaDTO.setObjetivo((String) request.get("objetivo"));
            ideaDTO.setTitulo("Nueva fórmula experimental - " + request.get("objetivo"));
            ideaDTO.setDescripcion("Fórmula generada automáticamente desde materias primas. " +
                    "Nota: Hubo un problema al procesar con IA, se creó una idea básica.");
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

    private IdeaDTO parseAIResponseFromMaterials(String aiResponse, String objetivo, List<Integer> materialIds) {
        System.out.println("==========================================");
        System.out.println("PARSING AI RESPONSE FROM MATERIALS");
        System.out.println("==========================================");
        System.out.println("Respuesta completa (primeros 500 caracteres): " + 
            (aiResponse != null ? aiResponse.substring(0, Math.min(500, aiResponse.length())) : "null"));
        
        IdeaDTO ideaDTO = new IdeaDTO();
        ideaDTO.setObjetivo(objetivo);
        categoryRepository.findByNombre("Nutracéutico").ifPresent(cat -> ideaDTO.setCategoriaId(cat.getId()));
        ideaDTO.setPrioridad("Alta");
        
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            System.err.println("ERROR: La respuesta de IA está vacía o es null");
            ideaDTO.setTitulo("Nueva fórmula experimental - " + objetivo);
            ideaDTO.setDescripcion("Fórmula generada automáticamente desde materias primas. " +
                    "Nota: La respuesta de la IA estaba vacía.");
            return ideaDTO;
        }
        
        try {
            // Limpiar la respuesta si tiene markdown code blocks
            String cleanedResponse = aiResponse;
            
            // Eliminar bloques de código markdown (```json ... ```)
            if (cleanedResponse.contains("```json")) {
                int startIndex = cleanedResponse.indexOf("```json");
                cleanedResponse = cleanedResponse.substring(startIndex + 7); // +7 para saltar "```json"
                int endIndex = cleanedResponse.indexOf("```");
                if (endIndex > 0) {
                    cleanedResponse = cleanedResponse.substring(0, endIndex);
                }
            } else if (cleanedResponse.contains("```")) {
                // Si solo tiene ``` sin especificar el lenguaje
                int startIndex = cleanedResponse.indexOf("```");
                cleanedResponse = cleanedResponse.substring(startIndex + 3); // +3 para saltar "```"
                int endIndex = cleanedResponse.indexOf("```");
                if (endIndex > 0) {
                    cleanedResponse = cleanedResponse.substring(0, endIndex);
                } else {
                    // Si no encuentra el cierre, eliminar solo el inicio
                    cleanedResponse = cleanedResponse.replace("```", "");
                }
            }
            
            // Eliminar cualquier texto antes del primer { si existe
            int firstBrace = cleanedResponse.indexOf('{');
            if (firstBrace > 0) {
                cleanedResponse = cleanedResponse.substring(firstBrace);
            }
            
            // Eliminar cualquier texto después del último } si existe
            int lastBrace = cleanedResponse.lastIndexOf('}');
            if (lastBrace > 0 && lastBrace < cleanedResponse.length() - 1) {
                cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
            }
            
            cleanedResponse = cleanedResponse.trim();
            
            System.out.println("Respuesta limpiada. Intentando parsear JSON...");
            System.out.println("Longitud total: " + cleanedResponse.length());
            System.out.println("Primeros 500 caracteres de respuesta limpiada: " + 
                cleanedResponse.substring(0, Math.min(500, cleanedResponse.length())));
            
            // Guardar JSON completo para debug si falla
            String jsonToParse = cleanedResponse;
            
            // Intentar parsear como JSON
            JsonNode jsonNode = null;
            try {
                jsonNode = objectMapper.readTree(jsonToParse);
            } catch (com.fasterxml.jackson.core.JsonParseException e) {
                System.err.println("ERROR al parsear JSON en primer intento: " + e.getMessage());
                System.err.println("Posición del error: línea " + e.getLocation().getLineNr() + ", columna " + e.getLocation().getColumnNr());
                
                // Guardar JSON completo para análisis
                System.err.println("JSON completo (primeros 2000 caracteres): " + 
                    cleanedResponse.substring(0, Math.min(2000, cleanedResponse.length())));
                
                // Intentar reparar: buscar el área problemática
                int errorLine = (int) e.getLocation().getLineNr();
                int errorCol = (int) e.getLocation().getColumnNr();
                
                // Mostrar contexto alrededor del error
                String[] lines = cleanedResponse.split("\n");
                if (errorLine > 0 && errorLine <= lines.length) {
                    System.err.println("Línea con error (" + errorLine + "): " + lines[errorLine - 1]);
                    if (errorLine > 1) {
                        System.err.println("Línea anterior: " + lines[errorLine - 2]);
                    }
                    if (errorLine < lines.length) {
                        System.err.println("Línea siguiente: " + lines[errorLine]);
                    }
                    // Mostrar caracteres alrededor de la columna problemática
                    if (errorCol > 0 && errorCol <= lines[errorLine - 1].length()) {
                        int start = Math.max(0, errorCol - 50);
                        int end = Math.min(lines[errorLine - 1].length(), errorCol + 50);
                        System.err.println("Contexto alrededor de columna " + errorCol + ": " + 
                            lines[errorLine - 1].substring(start, end));
                    }
                }
                
                // Intentar reparación: escapar saltos de línea y comillas dentro de strings
                try {
                    StringBuilder repaired = new StringBuilder();
                    boolean inString = false;
                    boolean escaped = false;
                    
                    for (int i = 0; i < cleanedResponse.length(); i++) {
                        char c = cleanedResponse.charAt(i);
                        
                        if (escaped) {
                            repaired.append(c);
                            escaped = false;
                            continue;
                        }
                        
                        if (c == '\\') {
                            escaped = true;
                            repaired.append(c);
                            continue;
                        }
                        
                        if (c == '"') {
                            inString = !inString;
                            repaired.append(c);
                            continue;
                        }
                        
                        if (inString) {
                            // Dentro de un string, escapar caracteres problemáticos
                            if (c == '\n') {
                                repaired.append("\\n");
                            } else if (c == '\r') {
                                repaired.append("\\r");
                                // Si es \r\n, saltar el \n
                                if (i + 1 < cleanedResponse.length() && cleanedResponse.charAt(i + 1) == '\n') {
                                    i++;
                                }
                            } else if (c == '\t') {
                                repaired.append("\\t");
                            } else if (c == '"' && !escaped) {
                                // Comilla no escapada dentro de string - esto no debería pasar
                                repaired.append("\\\"");
                            } else {
                                repaired.append(c);
                            }
                        } else {
                            repaired.append(c);
                        }
                    }
                    
                    jsonToParse = repaired.toString();
                    System.out.println("Intentando parsear JSON reparado (longitud: " + jsonToParse.length() + ")...");
                    jsonNode = objectMapper.readTree(jsonToParse);
                    System.out.println("JSON reparado y parseado exitosamente");
                } catch (Exception repairException) {
                    System.err.println("ERROR: No se pudo reparar el JSON: " + repairException.getMessage());
                    repairException.printStackTrace();
                    // Guardar JSON crudo completo para análisis manual
                    System.err.println("JSON completo que falló (guardado para análisis):");
                    System.err.println(cleanedResponse);
                    throw e; // Lanzar el error original
                }
            }
            System.out.println("JSON parseado exitosamente. Keys disponibles: " + jsonNode.fieldNames());
            
            // Extraer título
            if (jsonNode.has("titulo")) {
                ideaDTO.setTitulo(jsonNode.get("titulo").asText());
                System.out.println("Título extraído: " + ideaDTO.getTitulo());
            } else {
                ideaDTO.setTitulo("Nueva fórmula experimental - " + objetivo);
                System.out.println("No se encontró 'titulo' en el JSON, usando título por defecto");
            }
            
            // Extraer descripción
            if (jsonNode.has("descripcion")) {
                ideaDTO.setDescripcion(jsonNode.get("descripcion").asText());
                System.out.println("Descripción extraída (longitud): " + ideaDTO.getDescripcion().length());
            } else {
                ideaDTO.setDescripcion("Fórmula generada automáticamente desde materias primas.");
                System.out.println("No se encontró 'descripcion' en el JSON, usando descripción por defecto");
            }
            
            // Guardar la respuesta completa de la IA en formato JSON
            ideaDTO.setDetallesIA(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode));
            System.out.println("Detalles IA guardados (longitud): " + ideaDTO.getDetallesIA().length());
            
            // Extraer pruebas requeridas
            if (jsonNode.has("pruebasRequeridas")) {
                ideaDTO.setPruebasRequeridas(jsonNode.get("pruebasRequeridas").asText());
                System.out.println("Pruebas requeridas extraídas (longitud): " + 
                    (ideaDTO.getPruebasRequeridas() != null ? ideaDTO.getPruebasRequeridas().length() : 0));
            } else {
                System.out.println("No se encontró 'pruebasRequeridas' en el JSON");
            }
            
            // Extraer materiales seleccionados automáticamente por la IA
            if (jsonNode.has("materialesSeleccionados")) {
                JsonNode materialesSeleccionadosNode = jsonNode.get("materialesSeleccionados");
                if (materialesSeleccionadosNode.isArray()) {
                    List<Integer> materialesSeleccionados = new java.util.ArrayList<>();
                    for (JsonNode materialIdNode : materialesSeleccionadosNode) {
                        if (materialIdNode.isInt()) {
                            materialesSeleccionados.add(materialIdNode.asInt());
                        }
                    }
                    // Guardar en detallesIA como parte del JSON completo
                    System.out.println("Materiales seleccionados por IA: " + materialesSeleccionados.size());
                }
            }
            
            // Extraer justificación de selección
            if (jsonNode.has("justificacionSeleccion")) {
                String justificacion = jsonNode.get("justificacionSeleccion").asText();
                System.out.println("Justificación de selección extraída (longitud): " + justificacion.length());
                // Guardar en detallesIA como parte del JSON completo
            }
            
            // Extraer materiales sugeridos de BD externas
            if (jsonNode.has("materialesSugeridosBD")) {
                JsonNode materialesSugeridosNode = jsonNode.get("materialesSugeridosBD");
                if (materialesSugeridosNode.isArray()) {
                    System.out.println("Materiales sugeridos de BD externas: " + materialesSugeridosNode.size());
                    // Guardar en detallesIA como parte del JSON completo
                }
            }
            
            // Verificar que los campos importantes estén presentes
            boolean tieneIngredientes = jsonNode.has("ingredientes");
            boolean tieneParametros = jsonNode.has("parametrosFisicoquimicos");
            System.out.println("Tiene ingredientes: " + tieneIngredientes);
            System.out.println("Tiene parametrosFisicoquimicos: " + tieneParametros);
            
        } catch (com.fasterxml.jackson.core.JsonParseException e) {
            System.err.println("ERROR: Error al parsear JSON de la respuesta de IA: " + e.getMessage());
            System.err.println("Mensaje completo: " + e.getMessage());
            e.printStackTrace();
            ideaDTO.setTitulo("Nueva fórmula experimental - " + objetivo);
            ideaDTO.setDescripcion("Fórmula generada automáticamente desde materias primas. " +
                    "Nota: Hubo un problema al procesar con IA, se creó una idea básica. Error: " + e.getMessage());
            ideaDTO.setDetallesIA(aiResponse); // Guardar la respuesta cruda para debug
        } catch (Exception e) {
            System.err.println("ERROR: Excepción inesperada al procesar respuesta de IA: " + e.getMessage());
            System.err.println("Tipo de excepción: " + e.getClass().getName());
            e.printStackTrace();
            ideaDTO.setTitulo("Nueva fórmula experimental - " + objetivo);
            ideaDTO.setDescripcion("Fórmula generada automáticamente desde materias primas. " +
                    "Nota: Hubo un problema al procesar con IA, se creó una idea básica. Error: " + e.getMessage());
            ideaDTO.setDetallesIA(aiResponse); // Guardar la respuesta cruda para debug
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

    @GetMapping("/ordenes-produccion")
    public ResponseEntity<Map<String, Object>> getOrdenesProduccion(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        List<IdeaDTO> ordenes = ideaService.getOrdenesProduccionAsignadas(userId);
        Map<String, Object> response = new HashMap<>();
        Map<String, List<IdeaDTO>> data = new HashMap<>();
        data.put("ordenes", ordenes);
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

    @GetMapping("/{id}/formula")
    public ResponseEntity<Map<String, Object>> getFormulaByIdeaId(@PathVariable Integer id) {
        com.plm.plm.dto.FormulaDTO formula = formulaService.getFormulaByIdeaId(id);
        Map<String, Object> response = new HashMap<>();
        Map<String, com.plm.plm.dto.FormulaDTO> data = new HashMap<>();
        data.put("formula", formula);
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

