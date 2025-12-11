package com.plm.plm.services;

import com.plm.plm.Models.Material;
import com.plm.plm.Models.Product;
import com.plm.plm.Reposotory.MaterialRepository;
import com.plm.plm.Reposotory.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatAssistantService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Value("${groq.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public ChatAssistantService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Procesa una consulta del usuario y genera una respuesta usando IA
     */
    public Map<String, Object> processQuery(String userMessage, Integer userId) {
        // Obtener contexto del sistema
        String systemContext = buildSystemContext(userMessage);
        
        // Generar respuesta con Groq
        String aiResponse = generateChatResponse(userMessage, systemContext);
        
        // Construir respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("response", aiResponse);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return response;
    }

    /**
     * Construye el contexto del sistema basado en la consulta del usuario
     */
    private String buildSystemContext(String userMessage) {
        StringBuilder context = new StringBuilder();
        context.append("Eres un asistente IA para el Supervisor de Calidad en un sistema PLM/LIMS de una empresa de nutracéuticos.\n\n");
        
        String messageLower = userMessage.toLowerCase();
        
        // Si la consulta menciona stock, productos o materiales
        if (messageLower.contains("stock") || messageLower.contains("producto") || 
            messageLower.contains("materia") || messageLower.contains("cantidad") ||
            messageLower.contains("disponible") || messageLower.contains("inventario")) {
            
            // Agregar información de productos
            List<Product> products = productRepository.findAll();
            if (!products.isEmpty()) {
                context.append("PRODUCTOS EN INVENTARIO:\n");
                for (Product product : products) {
                    context.append(String.format("- %s (Código: %s): %.2f %s en stock\n", 
                        product.getNombre(), 
                        product.getCodigo(),
                        product.getCantidadStock(),
                        product.getUnidadMedida()));
                }
                context.append("\n");
            }
            
            // Agregar información de materias primas
            List<Material> materials = materialRepository.findAll();
            if (!materials.isEmpty()) {
                context.append("MATERIAS PRIMAS EN INVENTARIO:\n");
                for (Material material : materials) {
                    context.append(String.format("- %s (Código: %s): %.2f %s en stock\n", 
                        material.getNombre(), 
                        material.getCodigo(),
                        material.getCantidadStock(),
                        material.getUnidadMedida()));
                }
                context.append("\n");
            }
        }
        
        // Instrucciones para la IA
        context.append("INSTRUCCIONES:\n");
        context.append("- Responde de manera clara, concisa y profesional\n");
        context.append("- Si te preguntan por stock, usa los datos exactos proporcionados\n");
        context.append("- Si no encuentras información específica, indícalo claramente\n");
        context.append("- Puedes hacer cálculos y análisis basados en los datos\n");
        context.append("- Mantén un tono amigable pero profesional\n");
        context.append("- Responde en español\n");
        context.append("- CAPACIDAD DE NAVEGACIÓN: Tienes la capacidad de navegar por la interfaz de la aplicación para ayudar al usuario.\n");
        context.append("  Si el usuario solicita explícitamente 'ver', 'ir a', 'muéstrame' o 'navegar a' un producto, materia prima o sección:\n");
        context.append("  1. Responde amablemente confirmando la acción.\n");
        context.append("  2. Incluye AL FINAL de tu respuesta (en una línea nueva) el comando: <<NAVIGATE:RUTA>>\n");
        context.append("  TABLA DE RUTAS:\n");
        context.append("  - Ver un producto específico: /inventario/productos?search=NOMBRE_EXACTO_PRODUCTO (Ej: <<NAVIGATE:/inventario/productos?search=Vitamina C>>)\n");
        context.append("  - Ir al inventario de productos: /inventario/productos\n");
        context.append("  - Ver una materia prima específica: /inventario/materias-primas?search=NOMBRE_EXACTO_MATERIAL\n");
        context.append("  - Ir al inventario de materias primas: /inventario/materias-primas\n");
        context.append("  - Ir a Dashboard: /admin/dashboard\n");
        context.append("  - Ir a Ideas/Fórmulas: /ideas\n");
        context.append("  IMPORTANTE: Solo usa <<NAVIGATE:...>> si el usuario manifiesta intención de ver eso en la pantalla.\n");
        
        return context.toString();
    }

    /**
     * Genera una respuesta usando Groq AI
     */
    private String generateChatResponse(String userMessage, String systemContext) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Lo siento, el servicio de IA no está configurado correctamente. Por favor contacta al administrador del sistema.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            List<Map<String, String>> messages = new ArrayList<>();
            
            // Mensaje del sistema con contexto
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemContext);
            messages.add(systemMessage);
            
            // Mensaje del usuario
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile"); // Modelo de Groq
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                GROQ_API_URL,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    return message.get("content");
                }
            }

            return "Lo siento, no pude generar una respuesta en este momento.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Lo siento, ocurrió un error al procesar tu consulta: " + e.getMessage();
        }
    }

    /**
     * Obtiene el stock de un producto específico por nombre
     */
    public Map<String, Object> getProductStock(String productName) {
        List<Product> products = productRepository.findByNombreOrCodigoContaining(
            productName, 
            com.plm.plm.Enums.EstadoUsuario.ACTIVO
        );
        
        Map<String, Object> result = new HashMap<>();
        if (products.isEmpty()) {
            result.put("found", false);
            result.put("message", "No se encontró ningún producto con ese nombre");
        } else {
            result.put("found", true);
            result.put("products", products.stream().map(Product::getDTO).toList());
        }
        
        return result;
    }

    /**
     * Obtiene el stock de una materia prima específica por nombre
     */
    public Map<String, Object> getMaterialStock(String materialName) {
        List<Material> materials = materialRepository.findByNombreOrCodigoContaining(
            materialName,
            com.plm.plm.Enums.EstadoUsuario.ACTIVO
        );
        
        Map<String, Object> result = new HashMap<>();
        if (materials.isEmpty()) {
            result.put("found", false);
            result.put("message", "No se encontró ninguna materia prima con ese nombre");
        } else {
            result.put("found", true);
            result.put("materials", materials.stream().map(Material::getDTO).toList());
        }
        
        return result;
    }
}
