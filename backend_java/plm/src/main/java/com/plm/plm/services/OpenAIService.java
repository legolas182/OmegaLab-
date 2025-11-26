package com.plm.plm.services;

import com.plm.plm.Models.Product;
import com.plm.plm.Models.BOM;
import com.plm.plm.Models.BOMItem;
import com.plm.plm.Models.Material;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public OpenAIService() {
        this.restTemplate = new RestTemplate();
    }

    public String generateIdeaFromProduct(Product product, String objetivo, BOM bom, List<BOMItem> bomItems, List<Material> materialesDisponibles) {
        System.out.println("==========================================");
        System.out.println("LLAMANDO A API DE OPENAI");
        System.out.println("==========================================");
        System.out.println("Producto ID: " + product.getId());
        System.out.println("Producto: " + product.getNombre());
        System.out.println("Objetivo: " + objetivo);
        System.out.println("BOM disponible: " + (bom != null ? "Sí (ID: " + bom.getId() + ")" : "No"));
        System.out.println("Items BOM: " + (bomItems != null ? bomItems.size() : 0));
        System.out.println("Materiales disponibles en inventario: " + (materialesDisponibles != null ? materialesDisponibles.size() : 0));
        
        try {
            // Construir el prompt con la información del producto y su BOM
            String bomInfo = buildBOMInfo(bom, bomItems);
            String inventarioInfo = buildInventarioInfo(materialesDisponibles);
            
            System.out.println("BOM Info construido: " + (bomInfo.length() > 0 ? "Sí (" + bomInfo.length() + " caracteres)" : "No"));
            
            // Construir el prompt usando StringBuilder para evitar problemas con String.format() y paréntesis
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Eres un experto en formulación de productos nutracéuticos y suplementos deportivos.\n\n");
            promptBuilder.append("Producto base:\n");
            promptBuilder.append("- Nombre: ").append(product.getNombre()).append("\n");
            promptBuilder.append("- Código: ").append(product.getCodigo()).append("\n");
            promptBuilder.append("- Descripción: ").append(product.getDescripcion() != null ? product.getDescripcion() : "Sin descripción").append("\n");
            promptBuilder.append("- Categoría: ").append(product.getCategoriaNombre() != null ? product.getCategoriaNombre() : "Sin categoría").append("\n\n");
            promptBuilder.append(bomInfo).append("\n\n");
            promptBuilder.append(inventarioInfo).append("\n\n");
            promptBuilder.append("Objetivo del cliente: ").append(objetivo).append("\n\n");
            promptBuilder.append("Analiza el producto base, su BOM (Bill of Materials) completo y el inventario de materiales disponibles. ");
            promptBuilder.append("Genera una nueva fórmula adaptada que cumpla con el objetivo especificado.\n\n");
            promptBuilder.append("CONSIDERACIONES IMPORTANTES:\n");
            promptBuilder.append("1. Revisa el inventario de materiales disponibles antes de proponer cambios\n");
            promptBuilder.append("2. Si un ingrediente del BOM actual no está disponible en inventario, sugiere alternativas del inventario\n");
            promptBuilder.append("3. Si necesitas agregar nuevos ingredientes, verifica que estén disponibles en el inventario\n");
            promptBuilder.append("4. Calcula las cantidades necesarias y verifica que sean viables con el inventario\n");
            promptBuilder.append("5. Si un material no está disponible, sugiere alternativas similares del inventario\n");
            promptBuilder.append("6. Prioriza usar materiales que ya están en el inventario para reducir costos\n\n");
            promptBuilder.append("PREDICCIÓN DE PARÁMETROS FISICOQUÍMICOS:\n");
            promptBuilder.append("Para cada ingrediente de la fórmula propuesta, predice y analiza los siguientes parámetros fisicoquímicos:\n");
            promptBuilder.append("- Solubilidad: Predice la solubilidad del ingrediente en diferentes medios (acuoso, lipídico, etc.)\n");
            promptBuilder.append("- LogP: Predice el coeficiente de partición octanol-agua (logaritmo de la relación de concentraciones)\n");
            promptBuilder.append("- Estabilidad: Predice la estabilidad del ingrediente bajo diferentes condiciones (pH, temperatura, luz, etc.)\n");
            promptBuilder.append("- Biodisponibilidad: Predice la biodisponibilidad oral del ingrediente y su absorción\n");
            promptBuilder.append("- Compatibilidad: Predice la compatibilidad entre ingredientes y posibles interacciones\n\n");
            promptBuilder.append("IMPORTANTE: Responde ÚNICAMENTE en formato JSON válido con las siguientes claves:\n");
            promptBuilder.append("{\n");
            promptBuilder.append("  \"titulo\": \"Título descriptivo de la nueva fórmula\",\n");
            promptBuilder.append("  \"descripcion\": \"Descripción detallada y completa de la fórmula propuesta\",\n");
            promptBuilder.append("  \"bomModificado\": [\n");
            promptBuilder.append("    {\"ingrediente\": \"Nombre del ingrediente\", \"cantidadActual\": \"X kg/g\", \"cantidadPropuesta\": \"Y kg/g\", \"porcentajeActual\": X, \"porcentajePropuesto\": Y, \"disponibleEnInventario\": true/false, \"razon\": \"Razón del cambio\"}\n");
            promptBuilder.append("  ],\n");
            promptBuilder.append("  \"materialesNuevos\": [\"Material nuevo 1\", \"Material nuevo 2\"],\n");
            promptBuilder.append("  \"materialesEliminados\": [\"Material eliminado 1\", \"Material eliminado 2\"],\n");
            promptBuilder.append("  \"verificacionInventario\": \"Verificación de disponibilidad de materiales en inventario\",\n");
            promptBuilder.append("  \"escenariosPositivos\": [\"Escenario positivo 1\", \"Escenario positivo 2\"],\n");
            promptBuilder.append("  \"escenariosNegativos\": [\"Escenario negativo 1\", \"Escenario negativo 2\"],\n");
            promptBuilder.append("  \"justificacion\": \"Justificación técnica detallada de todos los cambios\",\n");
            promptBuilder.append("  \"parametrosFisicoquimicos\": {\n");
            promptBuilder.append("    \"solubilidad\": \"Predicción de solubilidad de la fórmula completa y sus componentes principales\",\n");
            promptBuilder.append("    \"logP\": \"Predicción del coeficiente de partición octanol-agua (LogP) y su impacto en la absorción\",\n");
            promptBuilder.append("    \"estabilidad\": \"Predicción de estabilidad bajo diferentes condiciones (pH, temperatura, almacenamiento)\",\n");
            promptBuilder.append("    \"biodisponibilidad\": \"Predicción de biodisponibilidad oral y absorción del producto final\",\n");
            promptBuilder.append("    \"compatibilidad\": \"Análisis de compatibilidad entre ingredientes y posibles interacciones o sinergias\"\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"pruebasRequeridas\": \"Lista detallada de pruebas de laboratorio que deben realizarse para validar la nueva fórmula. Formato: cada prueba en una línea nueva con guión, incluyendo el parámetro y su especificación. Ejemplo:\\n- pH (especificación: 6.5 - 7.5)\\n- Humedad (especificación: ≤ 5%%)\\n- Proteína (especificación: ≥ 80%%)\\n- Grasa (especificación: ≤ 10%%)\\n- Análisis microbiológico (especificación: Ausencia de patógenos)\"\n");
            promptBuilder.append("}\n\n");
            promptBuilder.append("Asegúrate de que el JSON sea válido y no incluyas texto adicional fuera del JSON.");
            
            String prompt = promptBuilder.toString();
            
            System.out.println("Prompt construido. Longitud: " + prompt.length() + " caracteres");

            // Preparar la solicitud a OpenAI
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");
            
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            requestBody.put("messages", List.of(message));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 3000);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            if (apiKey == null || apiKey.isEmpty()) {
                System.err.println("==========================================");
                System.err.println("ERROR: API Key de OpenAI no configurada");
                System.err.println("==========================================");
                System.err.println("Configura la variable de entorno OPENAI_API_KEY o crea application-local.properties");
                throw new RuntimeException("API Key de OpenAI no configurada. Configura OPENAI_API_KEY como variable de entorno.");
            }
            System.out.println("API Key configurada: Sí (longitud: " + apiKey.length() + ")");
            System.out.println("URL de API: " + OPENAI_API_URL);
            System.out.println("Enviando solicitud a OpenAI...");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Llamar a la API
            System.out.println("Realizando llamada HTTP POST a OpenAI...");
            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                request,
                Map.class
            );
            
            System.out.println("Respuesta recibida. Status: " + response.getStatusCode());
            System.out.println("Headers: " + response.getHeaders());

            // Extraer la respuesta
            Map<String, Object> responseBody = response.getBody();
            System.out.println("Response body recibido: " + (responseBody != null ? "Sí" : "No"));
            
            if (responseBody != null) {
                System.out.println("Keys en responseBody: " + responseBody.keySet());
                
                if (responseBody.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                    System.out.println("Número de choices: " + (choices != null ? choices.size() : 0));
                    
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        Map<String, Object> messageResponse = (Map<String, Object>) firstChoice.get("message");
                        String content = (String) messageResponse.get("content");
                        System.out.println("Contenido recibido de OpenAI (primeros 200 caracteres): " + 
                            (content != null ? content.substring(0, Math.min(200, content.length())) : "null"));
                        System.out.println("==========================================");
                        return content;
                    }
                } else if (responseBody.containsKey("error")) {
                    Map<String, Object> error = (Map<String, Object>) responseBody.get("error");
                    String errorMessage = error != null ? (String) error.get("message") : "Error desconocido";
                    System.err.println("ERROR de OpenAI: " + errorMessage);
                    throw new RuntimeException("Error de OpenAI: " + errorMessage);
                }
            }

            System.err.println("No se recibió respuesta válida de OpenAI");
            throw new RuntimeException("No se recibió respuesta válida de OpenAI");

        } catch (Exception e) {
            System.err.println("==========================================");
            System.err.println("ERROR AL LLAMAR A OPENAI");
            System.err.println("==========================================");
            System.err.println("Mensaje: " + e.getMessage());
            System.err.println("Tipo: " + e.getClass().getName());
            e.printStackTrace();
            System.err.println("==========================================");
            throw new RuntimeException("Error al generar idea con IA: " + e.getMessage(), e);
        }
    }

    private String buildBOMInfo(BOM bom, List<BOMItem> bomItems) {
        if (bom == null || bomItems == null || bomItems.isEmpty()) {
            return "BOM no disponible para este producto.";
        }

        StringBuilder bomInfo = new StringBuilder();
        bomInfo.append("BOM (Bill of Materials) del producto:\n");
        bomInfo.append("- Versión: ").append(bom.getVersion()).append("\n");
        bomInfo.append("- Estado: ").append(bom.getEstado()).append("\n");
        bomInfo.append("\nIngredientes:\n");

        for (BOMItem item : bomItems) {
            bomInfo.append(String.format(
                "- %s: %.2f %s (%.2f%%)\n",
                item.getMaterial().getNombre(),
                item.getCantidad().doubleValue(),
                item.getUnidad(),
                item.getPorcentaje().doubleValue()
            ));
        }

        return bomInfo.toString();
    }

    private String buildInventarioInfo(List<Material> materialesDisponibles) {
        if (materialesDisponibles == null || materialesDisponibles.isEmpty()) {
            return "INVENTARIO DE MATERIALES:\nNo hay materiales disponibles en el inventario.";
        }

        StringBuilder inventarioInfo = new StringBuilder();
        inventarioInfo.append("INVENTARIO DE MATERIALES DISPONIBLES:\n");
        inventarioInfo.append("Total de materiales en inventario: ").append(materialesDisponibles.size()).append("\n\n");
        
        // Agrupar por categoría
        java.util.Map<String, java.util.List<Material>> porCategoria = new java.util.HashMap<>();
        for (Material material : materialesDisponibles) {
            String categoria = material.getCategoriaNombre() != null ? material.getCategoriaNombre() : "Sin categoría";
            porCategoria.computeIfAbsent(categoria, k -> new java.util.ArrayList<>()).add(material);
        }

        for (java.util.Map.Entry<String, java.util.List<Material>> entry : porCategoria.entrySet()) {
            inventarioInfo.append("Categoría: ").append(entry.getKey()).append("\n");
            for (Material material : entry.getValue()) {
                inventarioInfo.append(String.format(
                    "  - %s (%s): %s [Unidad: %s]\n",
                    material.getNombre(),
                    material.getCodigo(),
                    material.getDescripcion() != null ? material.getDescripcion() : "Sin descripción",
                    material.getUnidadMedida()
                ));
            }
            inventarioInfo.append("\n");
        }

        inventarioInfo.append("NOTA: Todos estos materiales están disponibles en el inventario y pueden ser utilizados en la nueva fórmula.\n");
        inventarioInfo.append("Si necesitas usar un material que no está en esta lista, sugiere una alternativa del inventario o indica que se necesita adquirir.\n");

        return inventarioInfo.toString();
    }
}

