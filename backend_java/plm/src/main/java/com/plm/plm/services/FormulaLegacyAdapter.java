package com.plm.plm.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.plm.plm.Models.Material;
import com.plm.plm.Reposotory.MaterialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * FormulaLegacyAdapter (Tolerant Reader / Anti-Corruption Layer)
 * 
 * Este adaptador se encarga de detectar, transformar y normalizar los JSON de fórmulas
 * históricos (formato legacy) al "Esquema de Verdad Única" del sistema OmegaLab.
 * 
 * Garantiza retrocompatibilidad al vuelo sin necesidad de migrar la base de datos física.
 */
@Component
public class FormulaLegacyAdapter {

    private static final Logger logger = LoggerFactory.getLogger(FormulaLegacyAdapter.class);
    private final ObjectMapper objectMapper;
    private final MaterialRepository materialRepository;

    @Autowired
    public FormulaLegacyAdapter(ObjectMapper objectMapper, MaterialRepository materialRepository) {
        this.objectMapper = objectMapper;
        this.materialRepository = materialRepository;
    }

    /**
     * Normaliza un JSON de detalles de fórmula al formato estándar.
     * Si el JSON ya es nuevo, se devuelve sin cambios significativos.
     * Si es legacy, se transforma profundamente manteniendo la consistencia.
     * 
     * @param jsonRaw El string JSON proveniente de la base de datos (idea o fórmula).
     * @return JsonNode normalizado al Esquema de Verdad Única.
     */
    public JsonNode normalize(String jsonRaw) {
        if (jsonRaw == null || jsonRaw.trim().isEmpty()) {
            return objectMapper.createObjectNode();
        }

        String cleanedJson = cleanMarkdown(jsonRaw);

        // 0. ¿Es texto plano o JSON?
        if (!isMaybeJson(cleanedJson)) {
            logger.info("El contenido no parece ser JSON (Texto Plano). Creando nodo de información.");
            return createRawTextNode(cleanedJson);
        }

        try {
            JsonNode root = objectMapper.readTree(cleanedJson);
            
            // 1. Detección del Formato: ¿Es Legacy?
            if (isLegacyFormat(root)) {
                logger.info("Detectado formato legacy en JSON. Iniciando transformación al vuelo...");
                return transformLegacyToModern(root);
            }
            
            // 2. Paso Directo: Si ya es moderno, devolvemos el nodo parseado
            return root;

        } catch (Exception e) {
            // 🛑 REQUISITO CRÍTICO: Garantía de Cero Daños (Safety First)
            logger.warn("El contenido parece JSON pero no se pudo parsear. Devolviendo como texto crudo. Error: {}", e.getMessage());
            return createRawTextNode(cleanedJson);
        }
    }

    /**
     * Verifica heurísticamente si un string podría ser un JSON válido.
     */
    private boolean isMaybeJson(String content) {
        if (content == null) return false;
        String trimmed = content.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) || 
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }

    /**
     * Empaqueta texto plano en un nodo JSON que el frontend puede renderizar.
     */
    private JsonNode createRawTextNode(String text) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("titulo", "Información de la Fórmula / Resultado IA");
        node.put("descripcion", text);
        node.putArray("ingredientes"); // Array vacío para evitar errores de renderizado en UI
        node.put("metadata_text_only", true);
        return node;
    }

    /**
     * Remueve etiquetas de markdown como ```json o ``` que pueden envolver el JSON físico.
     */
    private String cleanMarkdown(String raw) {
        if (raw == null) return null;
        String cleaned = raw.trim();
        
        // Remover bloques de código markdown
        if (cleaned.startsWith("```")) {
            // Caso ```json
            if (cleaned.toLowerCase().startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else {
                // Caso ```
                cleaned = cleaned.substring(3);
            }
            
            // Remover el cierre ```
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        }
        
        return cleaned.trim();
    }

    /**
     * Determina si el JSON pertenece al formato antiguo.
     * El formato legacy se identifica si:
     * - No tiene el campo 'ingredientes' como array.
     * - O usa 'referencia', 'material_code' o IDs alfanuméricos (ej: MP-012) en lugar de IDs numéricos.
     * - O tiene una estructura anidada en 'composicion' en lugar de 'ingredientes'.
     */
    private boolean isLegacyFormat(JsonNode root) {
        // Si no tiene 'ingredientes' pero tiene 'composicion' (formato v0)
        if (!root.has("ingredientes") && root.has("composicion")) {
            return true;
        }

        // Si tiene 'ingredientes' pero el primer elemento usa 'ref' o 'codigo' en lugar de 'materialId'
        if (root.has("ingredientes") && root.get("ingredientes").isArray() && root.get("ingredientes").size() > 0) {
            JsonNode firstIng = root.get("ingredientes").get(0);
            return !firstIng.has("materialId") && (firstIng.has("ref") || firstIng.has("codigo") || firstIng.has("materialCode"));
        }

        return false;
    }

    /**
     * Transforma un nodo legacy al esquema de verdad única.
     */
    private JsonNode transformLegacyToModern(JsonNode legacyRoot) {
        ObjectNode modern = objectMapper.createObjectNode();
        
        // Mapeo de campos raíz: titulo (o nombre en legacy)
        String titulo = legacyRoot.has("titulo") ? legacyRoot.get("titulo").asText() : 
                        (legacyRoot.has("nombre") ? legacyRoot.get("nombre").asText() : "Fórmula Histórica");
        modern.put("titulo", titulo);
        
        modern.put("descripcion", legacyRoot.has("descripcion") ? legacyRoot.get("descripcion").asText() 
                                : (legacyRoot.has("meta_descripcion") ? legacyRoot.get("meta_descripcion").asText() : "Sin descripción"));
        
        modern.put("rendimiento", legacyRoot.has("rendimiento") ? legacyRoot.get("rendimiento").asDouble() : 100.0);
        modern.put("unidadRendimiento", legacyRoot.has("unidadRendimiento") ? legacyRoot.get("unidadRendimiento").asText() : "g");

        // Transformación de Ingredientes
        ArrayNode ingredientesModernos = modern.putArray("ingredientes");
        
        if (legacyRoot.has("ingredientes") && legacyRoot.get("ingredientes").isArray()) {
            // Caso 1: Array con nombres de campos viejos
            for (JsonNode oldIng : legacyRoot.get("ingredientes")) {
                ingredientesModernos.add(mapIngredientToModern(oldIng));
            }
        } else if (legacyRoot.has("composicion") && legacyRoot.get("composicion").isObject()) {
            // Caso 2: Objeto Mapa (Clave = Código Material)
            legacyRoot.get("composicion").fields().forEachRemaining(entry -> {
                ingredientesModernos.add(mapComposicionEntryToModern(entry.getKey(), entry.getValue()));
            });
        }

        return modern;
    }

    /**
     * Mapea un ingrediente individual de formato array legacy a moderno.
     */
    private ObjectNode mapIngredientToModern(JsonNode oldIng) {
        ObjectNode modernIng = objectMapper.createObjectNode();
        
        // Determinar el nombre/referencia del material
        String code = oldIng.has("ref") ? oldIng.get("ref").asText() : 
                      (oldIng.has("codigo") ? oldIng.get("codigo").asText() : 
                      (oldIng.has("materialCode") ? oldIng.get("materialCode").asText() : "UNKNOWN"));
        
        String nombre = oldIng.has("nombre") ? oldIng.get("nombre").asText() : "Ingrediente " + code;
        modernIng.put("nombre", nombre);
        
        // Mapeo de Cantidad y Unidad (Aplanado)
        modernIng.put("cantidad", oldIng.has("cantidad") ? oldIng.get("cantidad").asDouble() : 
                                 (oldIng.has("valor") ? oldIng.get("valor").asDouble() : 0.0));
        
        modernIng.put("unidad", oldIng.has("unidad") ? oldIng.get("unidad").asText() : 
                               (oldIng.has("un") ? oldIng.get("un").asText() : "g"));
        
        modernIng.put("porcentaje", oldIng.has("porcentaje") ? oldIng.get("porcentaje").asDouble() : 0.0);
        modernIng.put("funcion", oldIng.has("funcion") ? oldIng.get("funcion").asText() : "N/D");

        // 🛡️ TRADUCCIÓN DE IDs (Mecanismo para traducir IDs antiguos a los nuevos materialId)
        Integer materialId = lookupMaterialIdByCode(code);
        if (materialId != null) {
            modernIng.put("materialId", materialId);
        } else {
            modernIng.putNull("materialId");
        }

        return modernIng;
    }

    /**
     * Mapea una entrada de tipo Map (composicion) a moderno.
     */
    private ObjectNode mapComposicionEntryToModern(String code, JsonNode value) {
        ObjectNode modernIng = objectMapper.createObjectNode();
        modernIng.put("nombre", "Ingrediente " + code);
        
        if (value.isObject()) {
            modernIng.put("cantidad", value.has("q") ? value.get("q").asDouble() : 
                                     (value.has("cantidad") ? value.get("cantidad").asDouble() : 0.0));
            modernIng.put("unidad", value.has("u") ? value.get("u").asText() : "g");
        } else {
            modernIng.put("cantidad", value.asDouble());
            modernIng.put("unidad", "g");
        }

        Integer materialId = lookupMaterialIdByCode(code);
        if (materialId != null) {
            modernIng.put("materialId", materialId);
        } else {
            modernIng.putNull("materialId");
        }
        
        return modernIng;
    }

    /**
     * Traduce un código alfanumérico al ID entero actual.
     */
    private Integer lookupMaterialIdByCode(String code) {
        if (code == null || code.equals("UNKNOWN")) return null;
        try {
            Optional<Material> material = materialRepository.findByCodigo(code);
            return material.map(Material::getId).orElse(null);
        } catch (Exception e) {
            logger.warn("No se pudo consultar el código de material {} en la base de datos.", code);
            return null;
        }
    }

    /**
     * Crea un nodo seguro por defecto para evitar caídas de la aplicación.
     */
    private JsonNode createSafeFallbackNode(String rawContent) {
        ObjectNode fallback = objectMapper.createObjectNode();
        fallback.put("titulo", "Información de la Fórmula (Formato No Estándar)");
        fallback.put("descripcion", rawContent); // Mostramos el contenido crudo en la descripción
        fallback.putArray("ingredientes");
        fallback.put("metadata_error", true);
        return fallback;
    }
}
