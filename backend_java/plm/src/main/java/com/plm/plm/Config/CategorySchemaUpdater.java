package com.plm.plm.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Componente que actualiza el esquema de la tabla categorias
 * Se ejecuta después de que Hibernate inicialice las entidades y el contexto esté completamente refrescado
 */
@Component
@Order(1) // Ejecutar antes que el DataInitializer
public class CategorySchemaUpdater implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private boolean alreadyExecuted = false;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // Ejecutar solo una vez
        if (alreadyExecuted) {
            return;
        }
        alreadyExecuted = true;
        updateCategorySchema();
    }

    private void updateCategorySchema() {
        try {
            System.out.println("[CategorySchemaUpdater] Verificando y actualizando restricción única de categorias...");
            
            // Verificar si la tabla existe
            String checkTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'categorias'";
            Integer tableExists = jdbcTemplate.queryForObject(checkTable, Integer.class);
            
            if (tableExists == null || tableExists == 0) {
                System.out.println("[CategorySchemaUpdater] La tabla categorias no existe aún. Se creará automáticamente por JPA.");
                return;
            }

            // Verificar si existe la restricción única antigua (solo nombre)
            String checkOldConstraint = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND constraint_name = 'uk_nombre' AND table_name = 'categorias'";
            Integer oldConstraintExists = jdbcTemplate.queryForObject(checkOldConstraint, Integer.class);
            
            // SIEMPRE eliminar la restricción antigua si existe
            // Intentar múltiples veces con diferentes métodos
            if (oldConstraintExists != null && oldConstraintExists > 0) {
                System.out.println("[CategorySchemaUpdater] Eliminando restricción única antigua 'uk_nombre'...");
                boolean eliminada = false;
                
                // Método 1: DROP INDEX
                try {
                    jdbcTemplate.execute("ALTER TABLE categorias DROP INDEX uk_nombre");
                    System.out.println("[CategorySchemaUpdater] Restricción única antigua 'uk_nombre' eliminada exitosamente (DROP INDEX).");
                    eliminada = true;
                } catch (Exception e) {
                    System.out.println("[CategorySchemaUpdater] DROP INDEX falló: " + e.getMessage());
                }
                
                // Método 2: DROP CONSTRAINT (si DROP INDEX falló)
                if (!eliminada) {
                    try {
                        jdbcTemplate.execute("ALTER TABLE categorias DROP CONSTRAINT uk_nombre");
                        System.out.println("[CategorySchemaUpdater] Restricción única antigua 'uk_nombre' eliminada exitosamente (DROP CONSTRAINT).");
                        eliminada = true;
                    } catch (Exception e2) {
                        System.out.println("[CategorySchemaUpdater] DROP CONSTRAINT falló: " + e2.getMessage());
                    }
                }
                
                // Método 3: Verificar si todavía existe después de los intentos
                if (!eliminada) {
                    Integer stillExists = jdbcTemplate.queryForObject(checkOldConstraint, Integer.class);
                    if (stillExists != null && stillExists > 0) {
                        System.err.println("[CategorySchemaUpdater] ERROR: La restricción antigua 'uk_nombre' todavía existe después de intentar eliminarla.");
                        System.err.println("[CategorySchemaUpdater] Por favor, ejecuta manualmente: ALTER TABLE categorias DROP INDEX uk_nombre;");
                    } else {
                        System.out.println("[CategorySchemaUpdater] La restricción antigua fue eliminada (verificación posterior).");
                    }
                }
            }
            
            // Verificar si existe la restricción única nueva (nombre + tipo_producto)
            String checkNewConstraint = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND constraint_name = 'uk_nombre_tipo' AND table_name = 'categorias'";
            Integer newConstraintExists = jdbcTemplate.queryForObject(checkNewConstraint, Integer.class);
            
            // Crear la nueva restricción única compuesta si no existe
            if (newConstraintExists == null || newConstraintExists == 0) {
                System.out.println("[CategorySchemaUpdater] Creando restricción única compuesta 'uk_nombre_tipo'...");
                try {
                    jdbcTemplate.execute("ALTER TABLE categorias ADD CONSTRAINT uk_nombre_tipo UNIQUE (nombre, tipo_producto)");
                    System.out.println("[CategorySchemaUpdater] Restricción única compuesta 'uk_nombre_tipo' creada exitosamente.");
                } catch (Exception e) {
                    System.out.println("[CategorySchemaUpdater] Advertencia: No se pudo crear la nueva restricción: " + e.getMessage());
                }
            } else {
                System.out.println("[CategorySchemaUpdater] La restricción única compuesta 'uk_nombre_tipo' ya existe.");
            }
            
        } catch (Exception e) {
            System.err.println("[CategorySchemaUpdater] Error al actualizar esquema de categorias: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción para que la aplicación pueda continuar
        }
    }
}

