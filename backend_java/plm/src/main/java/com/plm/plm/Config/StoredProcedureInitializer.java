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
            
            System.out.println("Creando procedimiento desde archivo: " + resourcePath);
            
            // Primero eliminar el procedimiento si existe (ejecutar por separado)
            try {
                jdbcTemplate.execute("DROP PROCEDURE IF EXISTS " + procedureName);
            } catch (Exception e) {
                // Ignorar errores al eliminar (puede que no exista)
            }
            
            // Luego crear el procedimiento (ejecutar solo el CREATE, sin el DROP)
            String createSql = extractCreateProcedure(cleanSql);
            if (createSql != null && !createSql.trim().isEmpty()) {
                jdbcTemplate.execute(createSql);
                System.out.println("✓ Procedimiento " + procedureName + " creado exitosamente");
            } else {
                System.err.println("⚠ No se pudo extraer la sentencia CREATE PROCEDURE de: " + resourcePath);
            }
            
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
        
        // Reemplazar CREATE PROCEDURE IF NOT EXISTS por CREATE PROCEDURE
        cleaned = cleaned.replaceAll("(?i)CREATE\\s+PROCEDURE\\s+IF\\s+NOT\\s+EXISTS", "CREATE PROCEDURE");
        
        // Reemplazar el delimitador $$ al final del procedimiento por punto y coma
        cleaned = cleaned.replaceAll("\\$\\$", ";");
        
        return cleaned.trim();
    }
    
    /**
     * Extrae solo la sentencia CREATE PROCEDURE del SQL limpio
     * Usa un enfoque de profundidad para rastrear bloques BEGIN/END anidados
     */
    private String extractCreateProcedure(String sql) {
        String[] lines = sql.split("\\r?\\n");
        StringBuilder createSql = new StringBuilder();
        boolean inCreate = false;
        int depth = 0; // Profundidad de bloques BEGIN/END
        
        Pattern beginPattern = Pattern.compile("\\bBEGIN\\b", Pattern.CASE_INSENSITIVE);
        Pattern endControlPattern = Pattern.compile(
            "\\bEND\\s+(IF|LOOP|CASE|WHILE|REPEAT)\\b", 
            Pattern.CASE_INSENSITIVE
        );
        Pattern endPattern = Pattern.compile("\\bEND\\b", Pattern.CASE_INSENSITIVE);
        
        for (String line : lines) {
            String trimmedLine = line.trim();
            String upperLine = trimmedLine.toUpperCase();
            
            // Detectar inicio del CREATE PROCEDURE
            if (trimmedLine.matches("(?i).*CREATE\\s+PROCEDURE.*")) {
                inCreate = true;
            }
            
            if (inCreate) {
                createSql.append(line).append("\n");
                
                // Detectar BEGIN (aumenta profundidad)
                // Buscar todas las ocurrencias de BEGIN como palabra completa
                Matcher beginMatcher = beginPattern.matcher(trimmedLine);
                while (beginMatcher.find()) {
                    depth++;
                }
                
                // Detectar END (disminuye profundidad)
                // Primero verificar si hay END que sea parte de estructuras de control (END IF, END LOOP, etc.)
                boolean hasControlEnd = endControlPattern.matcher(trimmedLine).find();
                
                // Si hay END pero NO es parte de una estructura de control, disminuir profundidad
                if (!hasControlEnd) {
                    Matcher endMatcher = endPattern.matcher(trimmedLine);
                    while (endMatcher.find()) {
                        depth--;
                        
                        // Si la profundidad llegó a 0, hemos cerrado el BEGIN principal
                        // El END final del procedimiento generalmente tiene punto y coma o está solo
                        if (depth == 0 && (trimmedLine.contains(";") || upperLine.matches("^END\\s*$"))) {
                            break;
                        }
                    }
                }
            }
        }
        
        String result = createSql.toString().trim();
        // Asegurarse de que termine con punto y coma
        if (result.length() > 0 && !result.endsWith(";")) {
            result = result + ";";
        }
        return result.length() > 0 ? result : null;
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

