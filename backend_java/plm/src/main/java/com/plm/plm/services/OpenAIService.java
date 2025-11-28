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

    /**
     * Generar fórmula experimental desde materias primas seleccionadas (sin producto base)
     */
    public String generateFormulaFromMaterials(
            String objetivo,
            List<Integer> materialIds,
            List<Material> materialesDisponibles,
            List<com.plm.plm.Models.ChemicalCompound> compoundsFromDB) {
        
        System.out.println("==========================================");
        System.out.println("LLAMANDO A API DE OPENAI - DESDE MATERIAS PRIMAS");
        System.out.println("==========================================");
        System.out.println("Objetivo: " + objetivo);
        System.out.println("Materiales seleccionados: " + (materialIds != null ? materialIds.size() : 0));
        System.out.println("Materiales disponibles en inventario: " + (materialesDisponibles != null ? materialesDisponibles.size() : 0));
        System.out.println("Compuestos de BD químicas: " + (compoundsFromDB != null ? compoundsFromDB.size() : 0));
        
        try {
            String materialesSeleccionadosInfo = buildMaterialesSeleccionadosInfo(materialIds, materialesDisponibles);
            String inventarioInfo = buildInventarioInfo(materialesDisponibles);
            String compoundsInfo = buildCompoundsInfo(compoundsFromDB);
            
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Eres un experto químico formulador de productos nutracéuticos y suplementos deportivos.\n\n");
            promptBuilder.append("OBJETIVO DE LA FÓRMULA:\n");
            promptBuilder.append(objetivo).append("\n\n");
            
            if (materialesSeleccionadosInfo != null && !materialesSeleccionadosInfo.isEmpty()) {
                promptBuilder.append("MATERIAS PRIMAS SELECCIONADAS:\n");
                promptBuilder.append(materialesSeleccionadosInfo).append("\n\n");
            }
            
            promptBuilder.append(inventarioInfo).append("\n\n");
            
            if (compoundsInfo != null && !compoundsInfo.isEmpty()) {
                promptBuilder.append("COMPUESTOS QUÍMICOS DE BASES DE DATOS:\n");
                promptBuilder.append(compoundsInfo).append("\n\n");
            }
            
            promptBuilder.append("INSTRUCCIONES:\n");
            promptBuilder.append("Crea una fórmula experimental completa desde cero usando las materias primas seleccionadas y el inventario disponible.\n");
            promptBuilder.append("La fórmula debe cumplir con el objetivo especificado.\n\n");
            
            promptBuilder.append("REQUISITOS DE LA FÓRMULA:\n");
            promptBuilder.append("1. La suma de todos los porcentajes debe ser exactamente 100%\n");
            promptBuilder.append("2. Usa principalmente las materias primas seleccionadas\n");
            promptBuilder.append("3. Puedes agregar excipientes, saborizantes, endulzantes del inventario si es necesario\n");
            promptBuilder.append("4. Calcula las cantidades en gramos para un rendimiento de 1000g (1 kg batch)\n");
            promptBuilder.append("5. Especifica la función de cada ingrediente (proteína base, excipiente, saborizante, etc.)\n");
            promptBuilder.append("6. Calcula el contenido nutricional detallado (proteína, carbohidratos, grasas) por 100g y por ración típica\n");
            promptBuilder.append("7. Incluye cálculos paso a paso de macronutrientes cuando sea relevante\n\n");
            
            promptBuilder.append("CÁLCULOS NUTRICIONALES REQUERIDOS:\n");
            promptBuilder.append("Para cada fórmula, calcula y reporta:\n");
            promptBuilder.append("- Proteína total en el batch y por 100g\n");
            promptBuilder.append("- Carbohidratos totales en el batch y por 100g\n");
            promptBuilder.append("- Grasas totales en el batch y por 100g\n");
            promptBuilder.append("- Perfil nutricional por ración típica (ej: 30g o 100g según el tipo de producto)\n");
            promptBuilder.append("- Calorías aproximadas por 100g y por ración\n");
            promptBuilder.append("- Incluye los cálculos matemáticos cuando sea relevante (ej: WPI 90%% proteína × cantidad = proteína aportada)\n\n");
            
            promptBuilder.append("PROCESO DE FABRICACIÓN:\n");
            promptBuilder.append("Incluye recomendaciones sobre:\n");
            promptBuilder.append("- Orden de mezclado de ingredientes\n");
            promptBuilder.append("- Equipamiento necesario (mezcladores, tamices, etc.)\n");
            promptBuilder.append("- Tiempos de mezclado\n");
            promptBuilder.append("- Condiciones de almacenamiento\n");
            promptBuilder.append("- Buenas prácticas de manufactura\n\n");
            
            promptBuilder.append("PREDICCIÓN DE PARÁMETROS FISICOQUÍMICOS:\n");
            promptBuilder.append("Para la fórmula completa, predice:\n");
            promptBuilder.append("- Solubilidad: Predicción de solubilidad de la fórmula completa\n");
            promptBuilder.append("- LogP promedio: Coeficiente de partición promedio\n");
            promptBuilder.append("- pH estimado: pH esperado de la mezcla\n");
            promptBuilder.append("- Estabilidad: Estabilidad bajo diferentes condiciones\n");
            promptBuilder.append("- Compatibilidad: Compatibilidad entre ingredientes\n");
            promptBuilder.append("- Biodisponibilidad: Predicción de biodisponibilidad oral\n\n");
            
            promptBuilder.append("IMPORTANTE: Responde ÚNICAMENTE en formato JSON válido y bien formateado. NO uses markdown code blocks (```json).\n");
            promptBuilder.append("CRÍTICO: Todos los strings dentro del JSON deben tener saltos de línea escapados como \\n, NO uses saltos de línea reales dentro de strings.\n");
            promptBuilder.append("CRÍTICO: Todas las comillas dentro de strings deben estar escapadas como \\\".\n");
            promptBuilder.append("CRÍTICO: El JSON debe ser una sola línea o usar \\n para saltos de línea dentro de strings.\n\n");
            promptBuilder.append("Estructura JSON requerida (CRÍTICO: respeta exactamente esta estructura):\n");
            promptBuilder.append("{\n");
            promptBuilder.append("  \"titulo\": \"Título descriptivo de la fórmula\",\n");
            promptBuilder.append("  \"descripcion\": \"Descripción detallada. Usa \\\\n para saltos de línea.\",\n");
            promptBuilder.append("  \"rendimiento\": 1000,\n");
            promptBuilder.append("  \"unidadRendimiento\": \"g\",\n");
            promptBuilder.append("  \"ingredientes\": [\n");
            promptBuilder.append("    {\"nombre\": \"Nombre exacto\", \"cantidad\": X.XX, \"unidad\": \"g\", \"porcentaje\": X.XX, \"funcion\": \"Función específica\", \"materialId\": ID o null, \"contenidoProteina\": X.XX (si aplica), \"contenidoCarbohidratos\": X.XX (si aplica), \"contenidoGrasas\": X.XX (si aplica)}\n");
            promptBuilder.append("  ],\n");
            promptBuilder.append("  \"perfilNutricional\": {\n");
            promptBuilder.append("    \"por100g\": {\"proteina\": X.XX, \"carbohidratos\": X.XX, \"grasas\": X.XX, \"calorias\": X.XX},\n");
            promptBuilder.append("    \"porRacion\": {\"tamanoRacion\": X.XX, \"unidad\": \"g\", \"proteina\": X.XX, \"carbohidratos\": X.XX, \"grasas\": X.XX, \"calorias\": X.XX}\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"calculosNutricionales\": \"Explicación detallada de los cálculos. Usa \\\\n para saltos de línea. Ejemplo: WPI 90%% proteína × 890g = 801g proteína\\\\nProteína total batch = 801g + 6g (cacao) = 807g\\\\nProteína por 100g = (807g / 1000g) × 100 = 80.7g\",\n");
            promptBuilder.append("  \"procesoFabricacion\": \"Pasos detallados del proceso. Usa \\\\n para separar pasos. Ejemplo: 1. Pesado: pesar cada ingrediente con balanza analítica\\\\n2. Tamizado: tamizar polvos para romper aglomerados\\\\n3. Mezclado: añadir ingredientes mayoritarios primero...\",\n");
            promptBuilder.append("  \"buenasPracticas\": \"Recomendaciones de seguridad, calidad y regulación. Usa \\\\n para separar puntos.\",\n");
            promptBuilder.append("  \"parametrosFisicoquimicos\": {\n");
            promptBuilder.append("    \"solubilidad\": \"Predicción detallada\",\n");
            promptBuilder.append("    \"logP\": \"Valor o rango\",\n");
            promptBuilder.append("    \"pH\": \"Valor o rango\",\n");
            promptBuilder.append("    \"estabilidad\": \"Predicción detallada\",\n");
            promptBuilder.append("    \"compatibilidad\": \"Análisis detallado\",\n");
            promptBuilder.append("    \"biodisponibilidad\": \"Predicción detallada\"\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"escenariosPositivos\": [\"Escenario 1\", \"Escenario 2\"],\n");
            promptBuilder.append("  \"escenariosNegativos\": [\"Escenario 1\", \"Escenario 2\"],\n");
            promptBuilder.append("  \"justificacion\": \"Justificación técnica detallada. Usa \\\\n para saltos de línea.\",\n");
            promptBuilder.append("  \"pruebasRequeridas\": \"Lista de pruebas. Usa \\\\n para separar líneas. Ejemplo: - pH (especificación: 6.5 - 7.5)\\\\n- Humedad (especificación: ≤ 5%%)\\\\n- Proteína (especificación: ≥ 80%%)\"\n");
            promptBuilder.append("}\n\n");
            promptBuilder.append("REGLAS CRÍTICAS:\n");
            promptBuilder.append("1. El JSON debe ser válido y parseable\n");
            promptBuilder.append("2. NO uses saltos de línea reales (\\n) dentro de strings JSON - usa \\\\n\n");
            promptBuilder.append("3. NO uses comillas dobles sin escapar dentro de strings - usa \\\\\"\n");
            promptBuilder.append("4. La suma de porcentajes debe ser exactamente 100%%\n");
            promptBuilder.append("5. Responde SOLO con el JSON, sin texto adicional antes o después.\n");
            
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
            requestBody.put("max_tokens", 4000);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("API Key de OpenAI no configurada");
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Llamar a la API
            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                request,
                Map.class
            );

            // Extraer la respuesta
            Map<String, Object> responseBody = response.getBody();
            System.out.println("Status code de respuesta: " + response.getStatusCode());
            System.out.println("Response body keys: " + (responseBody != null ? responseBody.keySet() : "null"));
            
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                System.out.println("Número de choices: " + (choices != null ? choices.size() : 0));
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    System.out.println("First choice keys: " + firstChoice.keySet());
                    
                    Map<String, Object> messageResponse = (Map<String, Object>) firstChoice.get("message");
                    if (messageResponse != null) {
                        String content = (String) messageResponse.get("content");
                        System.out.println("Respuesta recibida de OpenAI (desde materias primas)");
                        System.out.println("Longitud de contenido: " + (content != null ? content.length() : 0));
                        System.out.println("Primeros 300 caracteres: " + 
                            (content != null ? content.substring(0, Math.min(300, content.length())) : "null"));
                        
                        if (content == null || content.trim().isEmpty()) {
                            throw new RuntimeException("La respuesta de OpenAI está vacía");
                        }
                        
                        return content;
                    } else {
                        throw new RuntimeException("No se encontró 'message' en la respuesta de OpenAI");
                    }
                } else {
                    throw new RuntimeException("No se encontraron 'choices' en la respuesta de OpenAI");
                }
            } else {
                System.err.println("ERROR: Response body no contiene 'choices'");
                System.err.println("Response body completo: " + responseBody);
                throw new RuntimeException("No se recibió respuesta válida de OpenAI. Response body: " + responseBody);
            }

        } catch (Exception e) {
            System.err.println("Error al generar fórmula desde materias primas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al generar fórmula con IA: " + e.getMessage(), e);
        }
    }

    private String buildMaterialesSeleccionadosInfo(List<Integer> materialIds, List<Material> materialesDisponibles) {
        if (materialIds == null || materialIds.isEmpty() || materialesDisponibles == null) {
            return null;
        }

        StringBuilder info = new StringBuilder();
        info.append("El químico ha seleccionado las siguientes materias primas para usar en la fórmula:\n\n");

        for (Integer materialId : materialIds) {
            Material material = materialesDisponibles.stream()
                .filter(m -> m.getId().equals(materialId))
                .findFirst()
                .orElse(null);
            
            if (material != null) {
                info.append(String.format(
                    "- %s (%s): %s [Unidad: %s]\n",
                    material.getNombre(),
                    material.getCodigo(),
                    material.getDescripcion() != null ? material.getDescripcion() : "Sin descripción",
                    material.getUnidadMedida()
                ));
            }
        }

        info.append("\nEstas materias primas DEBEN estar incluidas en la fórmula propuesta.\n");
        info.append("Puedes sugerir las proporciones adecuadas para cada una.\n");

        return info.toString();
    }

    private String buildCompoundsInfo(List<com.plm.plm.Models.ChemicalCompound> compounds) {
        if (compounds == null || compounds.isEmpty()) {
            return null;
        }

        StringBuilder info = new StringBuilder();
        info.append("El químico también ha consultado las siguientes bases de datos químicas:\n\n");

        for (com.plm.plm.Models.ChemicalCompound compound : compounds) {
            info.append(String.format(
                "- %s (Fuente: %s)\n",
                compound.getName(),
                compound.getSource()
            ));
            if (compound.getFormula() != null) {
                info.append("  Fórmula: ").append(compound.getFormula()).append("\n");
            }
            if (compound.getMolecularWeight() != null) {
                info.append("  Peso Molecular: ").append(compound.getMolecularWeight()).append(" g/mol\n");
            }
            if (compound.getLogP() != null) {
                info.append("  LogP: ").append(compound.getLogP()).append("\n");
            }
            if (compound.getSolubility() != null) {
                info.append("  Solubilidad: ").append(compound.getSolubility()).append("\n");
            }
            info.append("\n");
        }

        return info.toString();
    }
}

