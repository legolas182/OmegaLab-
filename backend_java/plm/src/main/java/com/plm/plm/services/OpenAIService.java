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
            
            // Si NO hay materiales seleccionados, la IA debe seleccionarlos automáticamente
            if (materialIds == null || materialIds.isEmpty()) {
                promptBuilder.append("INSTRUCCIÓN CRÍTICA: NO se han seleccionado materias primas. DEBES seleccionar automáticamente las materias primas más adecuadas del inventario disponible basándote SOLO en el objetivo especificado.\n");
                promptBuilder.append("Analiza el inventario completo y selecciona las materias primas que mejor cumplan con el objetivo.\n\n");
            } else {
                if (materialesSeleccionadosInfo != null && !materialesSeleccionadosInfo.isEmpty()) {
                    promptBuilder.append("MATERIAS PRIMAS PRE-SELECCIONADAS (puedes usar estas o seleccionar otras del inventario):\n");
                    promptBuilder.append(materialesSeleccionadosInfo).append("\n\n");
                }
            }
            
            promptBuilder.append("INVENTARIO COMPLETO DE MATERIAS PRIMAS DISPONIBLES:\n");
            promptBuilder.append(inventarioInfo).append("\n\n");
            
            if (compoundsInfo != null && !compoundsInfo.isEmpty()) {
                promptBuilder.append("COMPUESTOS QUÍMICOS DE BASES DE DATOS EXTERNAS DISPONIBLES:\n");
                promptBuilder.append(compoundsInfo).append("\n\n");
            }
            
            promptBuilder.append("INSTRUCCIONES CRÍTICAS:\n");
            promptBuilder.append("1. SELECCIÓN AUTOMÁTICA DE MATERIAS PRIMAS:\n");
            promptBuilder.append("   - Analiza el objetivo y el inventario completo\n");
            promptBuilder.append("   - Selecciona las materias primas MÁS ADECUADAS del inventario que cumplan con el objetivo\n");
            promptBuilder.append("   - Para cada material seleccionado, incluye su ID en el campo \"materialId\" del ingrediente\n");
            promptBuilder.append("   - Justifica claramente por qué seleccionaste cada material en \"justificacionSeleccion\"\n\n");
            promptBuilder.append("2. BÚSQUEDA Y SELECCIÓN AUTOMÁTICA DE COMPUESTOS EN BD EXTERNAS:\n");
            promptBuilder.append("   - DEBES buscar activamente en bases de datos externas (PubChem, ChEMBL, DrugBank, ZINC) compuestos que sean necesarios para la fórmula\n");
            promptBuilder.append("   - Si identificas que necesitas un compuesto específico (ej: dextrosa, HMB, BCAAs, vitaminas, etc.) que NO está en el inventario, DEBES buscarlo en las BD externas\n");
            promptBuilder.append("   - Para cada compuesto encontrado en BD externas, inclúyelo en \"materialesSugeridosBD\" con TODA su información:\n");
            promptBuilder.append("     * Nombre exacto del compuesto\n");
            promptBuilder.append("     * Fórmula molecular completa\n");
            promptBuilder.append("     * Peso molecular preciso\n");
            promptBuilder.append("     * LogP (si está disponible)\n");
            promptBuilder.append("     * Solubilidad\n");
            promptBuilder.append("     * Propiedades químicas y biológicas relevantes\n");
            promptBuilder.append("     * Fuente (PubChem, ChEMBL, DrugBank o ZINC)\n");
            promptBuilder.append("     * Justificación clara de por qué es necesario\n");
            promptBuilder.append("   - NO solo sugieras, BUSCA y SELECCIONA activamente los compuestos necesarios de las BD externas\n");
            promptBuilder.append("   - Si el inventario tiene todo lo necesario, puedes omitir esta sección, pero si falta algo crítico, DEBES buscarlo\n\n");
            promptBuilder.append("3. FÓRMULA PRECISA:\n");
            promptBuilder.append("   - Crea una fórmula química PRECISA y un protocolo de análisis COMPLETO\n");
            promptBuilder.append("   - La fórmula debe ser precisa, segura y cumplir con todas las especificaciones técnicas y regulatorias\n\n");
            
            promptBuilder.append("I. ESPECIFICACIONES DE MATERIAS PRIMAS:\n");
            promptBuilder.append("Para CADA materia prima utilizada en la fórmula, debes especificar:\n");
            promptBuilder.append("1. Requisitos de documentación:\n");
            promptBuilder.append("   - Hoja de especificaciones técnicas (SDS - Safety Data Sheet)\n");
            promptBuilder.append("   - Certificado de análisis (COA - Certificate of Analysis)\n");
            promptBuilder.append("   - Composición química detallada\n");
            promptBuilder.append("   - Formulaciones moleculares de todos los componentes\n");
            promptBuilder.append("   - Pureza y concentración de cada componente\n");
            promptBuilder.append("   - Fecha de fabricación y fecha de caducidad\n");
            promptBuilder.append("   - Condiciones de almacenamiento recomendadas\n\n");
            promptBuilder.append("2. Especificaciones técnicas por tipo de materia prima:\n");
            promptBuilder.append("   - Proteínas: Contenido proteico mínimo, humedad máxima, lactosa/grasa máxima, formulaciones moleculares de aminoácidos\n");
            promptBuilder.append("   - Creatina: Pureza mínima (ej: 99%%), humedad máxima, formulación molecular\n");
            promptBuilder.append("   - Excipientes: Especificaciones de pureza, humedad, granulometría\n");
            promptBuilder.append("   - Saborizantes/Endulzantes: Concentración, formulaciones moleculares\n\n");
            
            promptBuilder.append("II. COMBINACIONES Y GRAMAJES (CRÍTICO - 100%% DE MATERIAS PRIMAS):\n");
            promptBuilder.append("1. REGLA ABSOLUTA: La suma de todos los porcentajes DEBE ser EXACTAMENTE 100.00%%. NO puede ser 99.9%% ni 100.1%%, debe ser exactamente 100.00%%\n");
            promptBuilder.append("2. TODOS los ingredientes DEBEN ser materias primas del inventario o compuestos de BD externas. NO puedes dejar porcentajes sin asignar\n");
            promptBuilder.append("3. Calcula las cantidades en gramos para el rendimiento especificado\n");
            promptBuilder.append("4. Para cada ingrediente, especifica:\n");
            promptBuilder.append("   - Cantidad en gramos (debe sumar exactamente el rendimiento total)\n");
            promptBuilder.append("   - Porcentaje exacto (debe sumar exactamente 100.00%%)\n");
            promptBuilder.append("   - Función específica (proteína base, excipiente, saborizante, etc.)\n");
            promptBuilder.append("   - Contenido proteico, de carbohidratos y grasas del ingrediente\n");
            promptBuilder.append("   - Formulación molecular del componente principal\n");
            promptBuilder.append("   - materialId: Si es del inventario, incluye el ID. Si es de BD externa, puede ser null\n\n");
            promptBuilder.append("5. VALIDACIÓN OBLIGATORIA: Antes de responder, verifica que:\n");
            promptBuilder.append("   - Suma de porcentajes = 100.00%% (exactamente)\n");
            promptBuilder.append("   - Suma de cantidades en gramos = rendimiento total (exactamente)\n");
            promptBuilder.append("   - Todos los ingredientes tienen cantidad y porcentaje asignados\n");
            promptBuilder.append("   - No hay ingredientes con porcentaje 0%% o cantidad 0g\n\n");
            
            promptBuilder.append("III. CÁLCULOS NUTRICIONALES DETALLADOS:\n");
            promptBuilder.append("Para la fórmula completa, calcula y reporta:\n");
            promptBuilder.append("1. Por batch completo:\n");
            promptBuilder.append("   - Proteína total (en gramos) con cálculo paso a paso\n");
            promptBuilder.append("   - Carbohidratos totales (en gramos) con cálculo paso a paso\n");
            promptBuilder.append("   - Grasas totales (en gramos) con cálculo paso a paso\n");
            promptBuilder.append("   - Calorías totales\n\n");
            promptBuilder.append("2. Por 100g:\n");
            promptBuilder.append("   - Proteína (g)\n");
            promptBuilder.append("   - Carbohidratos (g)\n");
            promptBuilder.append("   - Grasas (g)\n");
            promptBuilder.append("   - Calorías (kcal)\n\n");
            promptBuilder.append("3. Por ración típica (especificar tamaño de ración):\n");
            promptBuilder.append("   - Proteína (g)\n");
            promptBuilder.append("   - Carbohidratos (g)\n");
            promptBuilder.append("   - Grasas (g)\n");
            promptBuilder.append("   - Calorías (kcal)\n\n");
            promptBuilder.append("4. Incluir cálculos matemáticos detallados:\n");
            promptBuilder.append("   Ejemplo: \"WPI 90%% proteína × 330g = 297g proteína\\nSoja XT 85%% proteína × 100g = 85g proteína\\nProteína total batch = 297g + 85g + ... = XXXg\\nProteína por 100g = (XXXg / 1000g) × 100 = XX.Xg\"\n\n");
            
            promptBuilder.append("IV. FÓRMULAS QUÍMICAS Y COMPOSICIÓN MOLECULAR:\n");
            promptBuilder.append("1. Para cada ingrediente principal, proporciona:\n");
            promptBuilder.append("   - Fórmula molecular del componente activo\n");
            promptBuilder.append("   - Peso molecular\n");
            promptBuilder.append("   - Estructura química básica (si es relevante)\n\n");
            promptBuilder.append("2. Fórmula química general de la mezcla final:\n");
            promptBuilder.append("   - Considerar las formulaciones moleculares de cada componente\n");
            promptBuilder.append("   - Proporciones utilizadas\n");
            promptBuilder.append("   - Interacciones químicas potenciales\n\n");
            
            promptBuilder.append("V. PROTOCOLO DE ANÁLISIS COMPLETO DEL PRODUCTO FINAL:\n");
            promptBuilder.append("Debes proporcionar un protocolo detallado que incluya:\n\n");
            promptBuilder.append("A. PRUEBAS FÍSICAS:\n");
            promptBuilder.append("   1. Apariencia: Descripción visual detallada (color, textura, granulometría)\n");
            promptBuilder.append("   2. Olor: Descripción olfativa\n");
            promptBuilder.append("   3. Solubilidad: Tiempo y facilidad de disolución en agua (especificar condiciones: temperatura, agitación)\n");
            promptBuilder.append("   4. Humedad: Método de Karl Fischer (especificar equipo y procedimiento)\n");
            promptBuilder.append("   5. Densidad aparente: Método y especificaciones\n\n");
            promptBuilder.append("B. PRUEBAS QUÍMICAS:\n");
            promptBuilder.append("   1. Contenido de proteína: Método Kjeldahl o Dumas (especificar método, equipo, estándares)\n");
            promptBuilder.append("   2. Contenido de grasa: Método Soxhlet (especificar solvente, tiempo, temperatura)\n");
            promptBuilder.append("   3. Contenido de carbohidratos: Cálculo por diferencia o método específico\n");
            promptBuilder.append("   4. Contenido de creatina (si aplica): Cromatografía líquida de alta resolución (HPLC) - especificar columna, fase móvil, detector\n");
            promptBuilder.append("   5. Perfil de aminoácidos: Cromatografía de intercambio iónico o HPLC - especificar método completo\n");
            promptBuilder.append("   6. Detección de metales pesados: Espectrometría de masas con plasma de acoplamiento inductivo (ICP-MS) - especificar elementos a analizar\n");
            promptBuilder.append("   7. pH: Método potenciométrico (especificar equipo y condiciones)\n");
            promptBuilder.append("   8. Cenizas: Método de calcinación (especificar temperatura y tiempo)\n\n");
            promptBuilder.append("C. PRUEBAS MICROBIOLÓGICAS:\n");
            promptBuilder.append("   1. Recuento total de bacterias aerobias: Placa de recuento (especificar medio, temperatura, tiempo de incubación)\n");
            promptBuilder.append("   2. Recuento de mohos y levaduras: Placa de recuento (especificar medio, temperatura, tiempo)\n");
            promptBuilder.append("   3. Detección de Escherichia coli: Método de detección específico (especificar medio, confirmación)\n");
            promptBuilder.append("   4. Detección de Salmonella: Método de detección específico (especificar pre-enriquecimiento, enriquecimiento selectivo, confirmación)\n");
            promptBuilder.append("   5. Recuento de coliformes: Método específico\n\n");
            promptBuilder.append("D. DIRECTRICES PARA EL ANALISTA:\n");
            promptBuilder.append("   1. Preparación de muestras: Procedimiento detallado paso a paso para cada tipo de prueba\n");
            promptBuilder.append("   2. Calibración de equipos: Especificar estándares de referencia, frecuencia de calibración\n");
            promptBuilder.append("   3. Control de calidad: Utilizar estándares de referencia, controles positivos y negativos\n");
            promptBuilder.append("   4. Interpretación de resultados: Criterios de aceptación y rechazo basados en especificaciones\n");
            promptBuilder.append("   5. Documentación: Formato de registro de resultados, observaciones, trazabilidad\n\n");
            
            promptBuilder.append("VI. PROCESO DE FABRICACIÓN:\n");
            promptBuilder.append("Incluye recomendaciones detalladas sobre:\n");
            promptBuilder.append("1. Orden de mezclado de ingredientes (paso a paso)\n");
            promptBuilder.append("2. Equipamiento necesario (mezcladores, tamices, balanzas, especificar capacidades)\n");
            promptBuilder.append("3. Tiempos de mezclado (especificar velocidad y duración)\n");
            promptBuilder.append("4. Condiciones ambientales (temperatura, humedad relativa)\n");
            promptBuilder.append("5. Condiciones de almacenamiento del producto final\n");
            promptBuilder.append("6. Buenas prácticas de manufactura (BPM/GMP)\n");
            promptBuilder.append("7. Control de calidad durante el proceso\n\n");
            
            promptBuilder.append("VII. PARÁMETROS FISICOQUÍMICOS PREDICHOS:\n");
            promptBuilder.append("Para la fórmula completa, predice y justifica:\n");
            promptBuilder.append("1. Solubilidad: Predicción detallada en diferentes medios (agua fría, caliente, leche)\n");
            promptBuilder.append("2. LogP promedio: Coeficiente de partición octanol-agua promedio (justificar cálculo)\n");
            promptBuilder.append("3. pH estimado: pH esperado de la mezcla final (justificar)\n");
            promptBuilder.append("4. Estabilidad: Estabilidad bajo diferentes condiciones (temperatura, humedad, luz, tiempo)\n");
            promptBuilder.append("5. Compatibilidad: Análisis detallado de compatibilidad entre ingredientes y posibles interacciones\n");
            promptBuilder.append("6. Biodisponibilidad: Predicción de biodisponibilidad oral y absorción\n");
            promptBuilder.append("7. Viscosidad: Si aplica para el producto final\n\n");
            
            promptBuilder.append("VIII. RECOMENDACIONES ADICIONALES:\n");
            promptBuilder.append("1. BCAAs y HMB: Evaluar necesidad de adición, cantidades recomendadas, formulaciones moleculares\n");
            promptBuilder.append("2. Carbohidratos: Evaluar necesidad de añadir carbohidratos de alto índice glucémico, cantidades recomendadas\n");
            promptBuilder.append("3. Vitaminas y minerales: Considerar adición si es relevante para el objetivo\n");
            promptBuilder.append("4. Optimización: Recomendaciones basadas en evidencia científica para mejorar la fórmula\n");
            promptBuilder.append("5. Consideraciones regulatorias: Cumplimiento con normativas aplicables\n\n");
            
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
            promptBuilder.append("  \"materialesSeleccionados\": [ID1, ID2, ID3],\n");
            promptBuilder.append("  \"justificacionSeleccion\": \"Explicación detallada de por qué seleccionaste cada material del inventario. Para cada material, indica: nombre, por qué es adecuado para el objetivo, qué aporta a la fórmula. Usa \\\\n para saltos de línea.\",\n");
            promptBuilder.append("  \"materialesSugeridosBD\": [\n");
            promptBuilder.append("    {\n");
            promptBuilder.append("      \"nombre\": \"Nombre exacto del compuesto (ej: Dextrosa, HMB, Leucina, etc.)\",\n");
            promptBuilder.append("      \"formulaMolecular\": \"Fórmula molecular completa y precisa (ej: C6H12O6 para dextrosa, C5H10O3 para HMB)\",\n");
            promptBuilder.append("      \"pesoMolecular\": X.XX (valor numérico preciso en g/mol),\n");
            promptBuilder.append("      \"logP\": X.XX (coeficiente de partición octanol-agua, si aplica y está disponible),\n");
            promptBuilder.append("      \"solubilidad\": \"Descripción detallada de solubilidad en agua, etanol, etc.\",\n");
            promptBuilder.append("      \"propiedades\": \"Propiedades químicas, físicas y biológicas relevantes (ej: índice glucémico, biodisponibilidad, función biológica)\",\n");
            promptBuilder.append("      \"justificacion\": \"Explicación clara de por qué este compuesto es necesario para cumplir el objetivo y por qué no está en el inventario\",\n");
            promptBuilder.append("      \"fuente\": \"PubChem\" o \"ChEMBL\" o \"DrugBank\" o \"ZINC\" (simula que lo encontraste en esta BD)\n");
            promptBuilder.append("    }\n");
            promptBuilder.append("  ],\n");
            promptBuilder.append("  INSTRUCCIÓN CRÍTICA Y OBLIGATORIA: DEBES buscar activamente compuestos en BD externas y AGREGARLOS a materialesSugeridosBD.\n");
            promptBuilder.append("  NO DEJES este array vacío a menos que el inventario tenga ABSOLUTAMENTE TODO lo necesario.\n");
            promptBuilder.append("  SIEMPRE busca y agrega al menos 1-3 compuestos que sean útiles para el objetivo, incluso si están parcialmente en inventario.\n");
            promptBuilder.append("  Ejemplos de compuestos que DEBES buscar y agregar si son relevantes:\n");
            promptBuilder.append("  - Carbohidratos: Dextrosa (C6H12O6), Maltodextrina, Fructosa, etc.\n");
            promptBuilder.append("  - Aminoácidos: HMB (C5H10O3), BCAAs individuales, Arginina, etc.\n");
            promptBuilder.append("  - Vitaminas: Vitamina D3, Vitamina B12, etc.\n");
            promptBuilder.append("  - Minerales: Magnesio, Zinc, etc.\n");
            promptBuilder.append("  - Otros: Creatina monohidratada, Beta-alanina, etc.\n");
            promptBuilder.append("  IMPORTANTE: Usa tu conocimiento de química y bases de datos (PubChem, ChEMBL, DrugBank, ZINC) para proporcionar información precisa.\n");
            promptBuilder.append("  Si el objetivo requiere algo específico (ej: \"alta en azúcar\"), DEBES buscar y agregar compuestos de carbohidratos de BD externas.\n\n");
            promptBuilder.append("  \"ingredientes\": [\n");
            promptBuilder.append("    {\n");
            promptBuilder.append("      \"nombre\": \"Nombre exacto\",\n");
            promptBuilder.append("      \"cantidad\": X.XX,\n");
            promptBuilder.append("      \"unidad\": \"g\",\n");
            promptBuilder.append("      \"porcentaje\": X.XX,\n");
            promptBuilder.append("      \"funcion\": \"Función específica\",\n");
            promptBuilder.append("      \"materialId\": ID o null,\n");
            promptBuilder.append("      \"contenidoProteina\": X.XX (si aplica),\n");
            promptBuilder.append("      \"contenidoCarbohidratos\": X.XX (si aplica),\n");
            promptBuilder.append("      \"contenidoGrasas\": X.XX (si aplica),\n");
            promptBuilder.append("      \"formulaMolecular\": \"Fórmula molecular del componente activo\",\n");
            promptBuilder.append("      \"pesoMolecular\": X.XX (si aplica),\n");
            promptBuilder.append("      \"especificacionesTecnicas\": {\n");
            promptBuilder.append("        \"requiereSDS\": true/false,\n");
            promptBuilder.append("        \"requiereCOA\": true/false,\n");
            promptBuilder.append("        \"purezaMinima\": \"X%% o especificación\",\n");
            promptBuilder.append("        \"humedadMaxima\": \"X%% o especificación\",\n");
            promptBuilder.append("        \"condicionesAlmacenamiento\": \"Descripción detallada\"\n");
            promptBuilder.append("      }\n");
            promptBuilder.append("    }\n");
            promptBuilder.append("  ],\n");
            promptBuilder.append("  \"perfilNutricional\": {\n");
            promptBuilder.append("    \"porBatch\": {\"proteina\": X.XX, \"carbohidratos\": X.XX, \"grasas\": X.XX, \"calorias\": X.XX},\n");
            promptBuilder.append("    \"por100g\": {\"proteina\": X.XX, \"carbohidratos\": X.XX, \"grasas\": X.XX, \"calorias\": X.XX},\n");
            promptBuilder.append("    \"porRacion\": {\"tamanoRacion\": X.XX, \"unidad\": \"g\", \"proteina\": X.XX, \"carbohidratos\": X.XX, \"grasas\": X.XX, \"calorias\": X.XX}\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"calculosNutricionales\": \"Explicación detallada paso a paso de TODOS los cálculos. Usa \\\\n para saltos de línea. Ejemplo: WPI 90%% proteína × 330g = 297g proteína\\\\nSoja XT 85%% proteína × 100g = 85g proteína\\\\nProteína total batch = 297g + 85g + ... = XXXg\\\\nProteína por 100g = (XXXg / 1000g) × 100 = XX.Xg\",\n");
            promptBuilder.append("  \"formulaQuimicaGeneral\": \"Fórmula química general de la mezcla final considerando las formulaciones moleculares de cada componente y las proporciones utilizadas. Usa \\\\n para saltos de línea.\",\n");
            promptBuilder.append("  \"procesoFabricacion\": \"Pasos detallados del proceso. Usa \\\\n para separar pasos. Ejemplo: 1. Pesado: pesar cada ingrediente con balanza analítica (especificar precisión)\\\\n2. Tamizado: tamizar polvos para romper aglomerados (especificar malla)\\\\n3. Mezclado: añadir ingredientes mayoritarios primero (especificar velocidad y tiempo)...\",\n");
            promptBuilder.append("  \"buenasPracticas\": \"Recomendaciones de seguridad, calidad, regulación y BPM/GMP. Usa \\\\n para separar puntos.\",\n");
            promptBuilder.append("  \"parametrosFisicoquimicos\": {\n");
            promptBuilder.append("    \"solubilidad\": \"Predicción detallada en diferentes medios (agua fría, caliente, leche) con justificación\",\n");
            promptBuilder.append("    \"logP\": \"Valor o rango con justificación del cálculo\",\n");
            promptBuilder.append("    \"pH\": \"Valor o rango con justificación\",\n");
            promptBuilder.append("    \"estabilidad\": \"Predicción detallada bajo diferentes condiciones (temperatura, humedad, luz, tiempo)\",\n");
            promptBuilder.append("    \"compatibilidad\": \"Análisis detallado de compatibilidad entre ingredientes y posibles interacciones químicas\",\n");
            promptBuilder.append("    \"biodisponibilidad\": \"Predicción detallada de biodisponibilidad oral y absorción\",\n");
            promptBuilder.append("    \"viscosidad\": \"Si aplica para el producto final\"\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"protocoloAnalisis\": {\n");
            promptBuilder.append("    \"pruebasFisicas\": {\n");
            promptBuilder.append("      \"apariencia\": \"Descripción detallada del procedimiento y especificaciones\",\n");
            promptBuilder.append("      \"olor\": \"Descripción del procedimiento\",\n");
            promptBuilder.append("      \"solubilidad\": \"Método detallado con condiciones (temperatura, agitación, tiempo)\",\n");
            promptBuilder.append("      \"humedad\": \"Método de Karl Fischer con especificación de equipo y procedimiento\",\n");
            promptBuilder.append("      \"densidadAparente\": \"Método y especificaciones\"\n");
            promptBuilder.append("    },\n");
            promptBuilder.append("    \"pruebasQuimicas\": {\n");
            promptBuilder.append("      \"proteina\": \"Método Kjeldahl o Dumas con especificación de método, equipo y estándares\",\n");
            promptBuilder.append("      \"grasa\": \"Método Soxhlet con especificación de solvente, tiempo y temperatura\",\n");
            promptBuilder.append("      \"carbohidratos\": \"Método de cálculo por diferencia o método específico\",\n");
            promptBuilder.append("      \"creatina\": \"HPLC con especificación de columna, fase móvil y detector (si aplica)\",\n");
            promptBuilder.append("      \"perfilAminoacidos\": \"Cromatografía de intercambio iónico o HPLC con método completo\",\n");
            promptBuilder.append("      \"metalesPesados\": \"ICP-MS con especificación de elementos a analizar\",\n");
            promptBuilder.append("      \"pH\": \"Método potenciométrico con especificación de equipo y condiciones\",\n");
            promptBuilder.append("      \"cenizas\": \"Método de calcinación con especificación de temperatura y tiempo\"\n");
            promptBuilder.append("    },\n");
            promptBuilder.append("    \"pruebasMicrobiologicas\": {\n");
            promptBuilder.append("      \"bacteriasAerobias\": \"Placa de recuento con especificación de medio, temperatura y tiempo de incubación\",\n");
            promptBuilder.append("      \"mohosLevaduras\": \"Placa de recuento con especificación de medio, temperatura y tiempo\",\n");
            promptBuilder.append("      \"eColi\": \"Método de detección específico con especificación de medio y confirmación\",\n");
            promptBuilder.append("      \"salmonella\": \"Método de detección específico con especificación de pre-enriquecimiento, enriquecimiento selectivo y confirmación\",\n");
            promptBuilder.append("      \"coliformes\": \"Método específico\"\n");
            promptBuilder.append("    },\n");
            promptBuilder.append("    \"directricesAnalista\": {\n");
            promptBuilder.append("      \"preparacionMuestras\": \"Procedimiento detallado paso a paso para cada tipo de prueba\",\n");
            promptBuilder.append("      \"calibracionEquipos\": \"Especificar estándares de referencia y frecuencia de calibración\",\n");
            promptBuilder.append("      \"controlCalidad\": \"Utilizar estándares de referencia, controles positivos y negativos\",\n");
            promptBuilder.append("      \"interpretacionResultados\": \"Criterios de aceptación y rechazo basados en especificaciones\",\n");
            promptBuilder.append("      \"documentacion\": \"Formato de registro de resultados, observaciones y trazabilidad\"\n");
            promptBuilder.append("    }\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"recomendacionesAdicionales\": {\n");
            promptBuilder.append("    \"bcaasHmb\": \"Evaluación de necesidad, cantidades recomendadas y formulaciones moleculares\",\n");
            promptBuilder.append("    \"carbohidratos\": \"Evaluación de necesidad de añadir carbohidratos de alto índice glucémico y cantidades recomendadas\",\n");
            promptBuilder.append("    \"vitaminasMinerales\": \"Consideración de adición si es relevante para el objetivo\",\n");
            promptBuilder.append("    \"optimizacion\": \"Recomendaciones basadas en evidencia científica para mejorar la fórmula\",\n");
            promptBuilder.append("    \"consideracionesRegulatorias\": \"Cumplimiento con normativas aplicables\"\n");
            promptBuilder.append("  },\n");
            promptBuilder.append("  \"escenariosPositivos\": [\"Escenario 1\", \"Escenario 2\"],\n");
            promptBuilder.append("  \"escenariosNegativos\": [\"Escenario 1\", \"Escenario 2\"],\n");
            promptBuilder.append("  \"justificacion\": \"Justificación técnica detallada basada en evidencia científica. Usa \\\\n para saltos de línea.\",\n");
            promptBuilder.append("  \"pruebasRequeridas\": \"Lista completa de pruebas con especificaciones. Usa \\\\n para separar líneas. Ejemplo: - pH (especificación: 6.5 - 7.5, método: potenciométrico)\\\\n- Humedad (especificación: ≤ 5%%, método: Karl Fischer)\\\\n- Proteína (especificación: ≥ 80%%, método: Kjeldahl)\\\\n- Recuento de bacterias aerobias (especificación: < 10,000 UFC/g, método: placa de recuento)\"\n");
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
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 8000);

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

