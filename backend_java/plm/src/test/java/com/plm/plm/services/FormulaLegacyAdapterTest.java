package com.plm.plm.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.plm.Models.Material;
import com.plm.plm.Reposotory.MaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FormulaLegacyAdapterTest {

    private FormulaLegacyAdapter adapter;
    private ObjectMapper objectMapper;

    @Mock
    private MaterialRepository materialRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();
        adapter = new FormulaLegacyAdapter(objectMapper, materialRepository);
    }

    @Test
    @DisplayName("🧪 Prueba 1: JSON Moderno (Verdad Única) - Paso Directo")
    void testModernFormatPassthrough() {
        String modernJson = "{" +
                "\"titulo\": \"Fórmula Proteína\"," +
                "\"ingredientes\": [" +
                "  {\"nombre\": \"WPI\", \"materialId\": 101, \"cantidad\": 500, \"unidad\": \"g\"}" +
                "]" +
                "}";

        JsonNode result = adapter.normalize(modernJson);

        assertEquals("Fórmula Proteína", result.get("titulo").asText());
        assertEquals(101, result.get("ingredientes").get(0).get("materialId").asInt());
        assertEquals("WPI", result.get("ingredientes").get(0).get("nombre").asText());
    }

    @Test
    @DisplayName("🧪 Prueba 2: JSON Legacy V1 (IDs alfanuméricos en ingredientes[])")
    void testLegacyFormatV1() {
        // Mocking repo para traducir MP-006 -> 106
        Material mockMaterial = new Material();
        mockMaterial.setId(106);
        mockMaterial.setCodigo("MP-006");
        when(materialRepository.findByCodigo("MP-006")).thenReturn(Optional.of(mockMaterial));

        String legacyJson = "{" +
                "\"nombre\": \"Fórmula Antigua v1\"," +
                "\"ingredientes\": [" +
                "  {\"ref\": \"MP-006\", \"valor\": 300, \"un\": \"g\", \"nombre\": \"Creatina P-12\"}" +
                "]" +
                "}";

        JsonNode result = adapter.normalize(legacyJson);

        // Verificamos que se normalizó al esquema actual
        assertEquals("Fórmula Antigua v1", result.get("titulo").asText()); // nombre -> titulo
        assertEquals(1, result.get("ingredientes").size());
        
        JsonNode firstIng = result.get("ingredientes").get(0);
        assertEquals(106, firstIng.get("materialId").asInt()); // Traducido MP-006 -> 106
        assertEquals(300.0, firstIng.get("cantidad").asDouble()); // valor -> cantidad
        assertEquals("g", firstIng.get("unidad").asText()); // un -> unidad
    }

    @Test
    @DisplayName("🧪 Prueba 3: JSON Legacy V0 (Estructura anidada en 'composicion' tipo Map)")
    void testLegacyFormatV0Composicion() {
        Material mockMaterial = new Material();
        mockMaterial.setId(101);
        when(materialRepository.findByCodigo("MP-001")).thenReturn(Optional.of(mockMaterial));

        String legacyJson = "{" +
                "\"titulo\": \"Fórmula V0\"," +
                "\"composicion\": {" +
                "  \"MP-001\": {\"q\": 150, \"u\": \"kg\"}" +
                "}" +
                "}";

        JsonNode result = adapter.normalize(legacyJson);

        assertTrue(result.has("ingredientes")); // composicion -> ingredientes[]
        JsonNode firstIng = result.get("ingredientes").get(0);
        assertEquals(101, firstIng.get("materialId").asInt());
        assertEquals(150.0, firstIng.get("cantidad").asDouble()); // q -> cantidad
        assertEquals("kg", firstIng.get("unidad").asText()); // u -> unidad
    }

    @Test
    @DisplayName("🧪 Prueba 4: JSON envuelto en Markdown (Limpieza de Bug)")
    void testMarkdownCleaning() {
        String markdownJson = "```json\n" +
                "{" +
                "  \"titulo\": \"Fórmula Markdown\"," +
                "  \"ingredientes\": []" +
                "}\n" +
                "```";

        JsonNode result = adapter.normalize(markdownJson);

        assertEquals("Fórmula Markdown", result.get("titulo").asText());
        assertFalse(result.has("metadata_error"));
    }

    @Test
    @DisplayName("🧪 Prueba 5: Manejo de Texto Plano (No JSON)")
    void testPlainTextHandling() {
        String plainText = "La IA está procesando la fórmula, por favor espere...";
        
        JsonNode result = adapter.normalize(plainText);
        
        assertEquals("Información de la Fórmula / Resultado IA", result.get("titulo").asText());
        assertEquals(plainText, result.get("descripcion").asText());
        assertTrue(result.get("ingredientes").isArray());
        assertTrue(result.has("metadata_text_only"));
    }

    @Test
    @DisplayName("🛑 Requisito Crítico: Safety First - Manejo de JSON Corrupto")
    void testSafetyFallbackGraceful() {
        String corruptJson = "{ invalid: json, [ [ ";

        // El adaptador no debe arrojar excepción
        JsonNode result = assertDoesNotThrow(() -> adapter.normalize(corruptJson));

        // Debe devolver el nodo de seguridad
        assertTrue(result.has("metadata_error"));
        assertEquals("Error de Carga: Formato No Reconocido", result.get("titulo").asText());
    }
}
