package com.plm.plm.Controllers;

import com.plm.plm.services.ChatAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatAssistantController {

    @Autowired
    private ChatAssistantService chatAssistantService;

    /**
     * Endpoint para procesar mensajes del chatbot
     */
    @PostMapping("/assistant")
    public ResponseEntity<?> processMessage(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "El mensaje no puede estar vacío");
                return ResponseEntity.badRequest().body(error);
            }

            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            // Procesar la consulta
            Map<String, Object> result = chatAssistantService.processQuery(message, null);
            
            // Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("data", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al procesar el mensaje: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Endpoint para obtener stock de un producto específico
     */
    @GetMapping("/product-stock")
    public ResponseEntity<?> getProductStock(@RequestParam String name) {
        try {
            Map<String, Object> result = chatAssistantService.getProductStock(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener stock: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Endpoint para obtener stock de una materia prima específica
     */
    @GetMapping("/material-stock")
    public ResponseEntity<?> getMaterialStock(@RequestParam String name) {
        try {
            Map<String, Object> result = chatAssistantService.getMaterialStock(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener stock: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
