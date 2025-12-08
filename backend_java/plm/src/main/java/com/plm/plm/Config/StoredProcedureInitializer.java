package com.plm.plm.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Componente que inicializa los procedimientos almacenados desde archivos SQL
 * Se ejecuta al inicio de la aplicación, antes que DataInitializer
 */
@Component
@Order(0) // Ejecutar antes que DataInitializer (que tiene Order por defecto)
public class StoredProcedureInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ResourceLoader resourceLoader;

    @Override
    public void run(String... args) throws Exception {
        createStoredProcedures();
    }

    private void createStoredProcedures() {
        try {
           
            System.out.println("INICIALIZANDO PROCEDIMIENTOS ALMACENADOS");
            
            // Cargar procedimientos desde archivos SQL
            loadProcedureFromFile("classpath:procedures/ValidarPorcentajesBOM.sql");
            loadProcedureFromFile("classpath:procedures/VerificarStockProduccion.sql");
            loadProcedureFromFile("classpath:procedures/CalcularTotalesBOM.sql");
            loadProcedureFromFile("classpath:procedures/ActualizarStockProduccion.sql");
            loadProcedureFromFile("classpath:procedures/ReporteStockBajo.sql");
            loadProcedureFromFile("classpath:procedures/ObtenerHistorialBOM.sql");
            loadProcedureFromFile("classpath:procedures/ValidarIntegridadBOM.sql");
            
            System.out.println("Procedimientos almacenados inicializados correctamente");
            
        } catch (Exception e) {
            System.err.println("Error crítico al crear procedimientos almacenados: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción para que la aplicación pueda continuar
        }
    }

    /**
     * Carga un procedimiento almacenado desde un archivo SQL
     */
    private void loadProcedureFromFile(String resourcePath) {
        try {
            Resource resource = resourceLoader.getResource(resourcePath);
            
            if (!resource.exists()) {
                System.out.println("⚠ Archivo no encontrado: " + resourcePath + " (omitido)");
                return;
            }
            
            // Leer el archivo SQL de forma compatible con todas las versiones de Java
            String sql;
            try (InputStream inputStream = resource.getInputStream()) {
                sql = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            }
            
            // Extraer el nombre del procedimiento del SQL
            String procedureName = extractProcedureName(sql);
            
            if (procedureName == null || procedureName.equals("UNKNOWN")) {
                System.err.println("⚠ No se pudo extraer el nombre del procedimiento de: " + resourcePath);
                return;
            }
            
            // Limpiar el SQL antes de verificar (para extraer el nombre correctamente)
            String cleanSql = cleanSqlForExecution(sql);
            
            // Verificar si existe después de limpiar (por si el nombre cambió)
            String finalProcedureName = extractProcedureName(cleanSql);
            if (finalProcedureName != null && !finalProcedureName.equals("UNKNOWN")) {
                procedureName = finalProcedureName;
            }
            
            if (procedureExists(procedureName)) {
                System.out.println("✓ Procedimiento " + procedureName + " ya existe, omitiendo...");
                return;
            }
            
            System.out.println("Creando procedimiento desde archivo: " + resourcePath);
            
            // Ejecutar el SQL limpio
            jdbcTemplate.execute(cleanSql);
            
            System.out.println("✓ Procedimiento " + procedureName + " creado exitosamente");
            
        } catch (Exception e) {
            System.err.println("Error al cargar procedimiento desde " + resourcePath + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Extrae el nombre del procedimiento del SQL
     */
    private String extractProcedureName(String sql) {
        // Buscar CREATE PROCEDURE nombre_procedimiento
        Pattern pattern = Pattern.compile(
            "(?:CREATE\\s+PROCEDURE\\s+|PROCEDURE\\s+)(?:IF\\s+NOT\\s+EXISTS\\s+)?(\\w+)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(sql);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "UNKNOWN";
    }

    /**
     * Limpia el SQL para ejecución (elimina DELIMITER que MySQL no acepta en JDBC)
     * También maneja el caso especial de CREATE PROCEDURE IF NOT EXISTS
     */
    private String cleanSqlForExecution(String sql) {
        // Eliminar líneas DELIMITER al inicio
        String cleaned = sql.replaceAll("(?i)^\\s*DELIMITER\\s+[^\\n\\r]*[\\n\\r]+", "");
        
        // Eliminar líneas DELIMITER al final
        cleaned = cleaned.replaceAll("(?i)[\\n\\r]+\\s*DELIMITER\\s*;?\\s*$", "");
        
        // Eliminar líneas DELIMITER en medio del código (multilínea)
        cleaned = cleaned.replaceAll("(?i)[\\n\\r]+\\s*DELIMITER\\s+[^\\n\\r]*[\\n\\r]+", "\n");
        
        // Reemplazar CREATE PROCEDURE IF NOT EXISTS por DROP PROCEDURE IF EXISTS + CREATE PROCEDURE
        // Esto asegura que el procedimiento se actualice si ya existe
        Pattern ifNotExistsPattern = Pattern.compile(
            "(?i)CREATE\\s+PROCEDURE\\s+IF\\s+NOT\\s+EXISTS\\s+(\\w+)",
            Pattern.MULTILINE
        );
        Matcher matcher = ifNotExistsPattern.matcher(cleaned);
        if (matcher.find()) {
            String procedureName = matcher.group(1);
            // Agregar DROP PROCEDURE IF EXISTS antes del CREATE
            cleaned = "DROP PROCEDURE IF EXISTS " + procedureName + ";\n" + 
                     cleaned.replaceFirst("(?i)CREATE\\s+PROCEDURE\\s+IF\\s+NOT\\s+EXISTS", "CREATE PROCEDURE");
        }
        
        return cleaned.trim();
    }

    /**
     * Verifica si un procedimiento almacenado ya existe
     */
    private boolean procedureExists(String procedureName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.routines " +
                        "WHERE routine_schema = DATABASE() " +
                        "AND routine_name = ? " +
                        "AND routine_type = 'PROCEDURE'";
            
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, procedureName);
            return count != null && count > 0;
        } catch (Exception e) {
            System.err.println("Error al verificar existencia del procedimiento " + procedureName + ": " + e.getMessage());
            return false;
        }
    }
}

