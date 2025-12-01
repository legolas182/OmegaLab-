-- Migración: Corregir restricción única de la tabla categorias
-- Fecha: 2024
-- Este script elimina la restricción única antigua y crea la nueva restricción compuesta

USE proscience;

-- Eliminar la restricción única antigua (solo nombre)
-- Intentar primero con DROP INDEX
SET @exist := (SELECT COUNT(*) FROM information_schema.table_constraints 
               WHERE constraint_schema = 'proscience' 
               AND constraint_name = 'uk_nombre' 
               AND table_name = 'categorias');

SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE categorias DROP INDEX uk_nombre', 'SELECT "Restricción uk_nombre no existe"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si DROP INDEX no funcionó, intentar con DROP CONSTRAINT
SET @exist2 := (SELECT COUNT(*) FROM information_schema.table_constraints 
                WHERE constraint_schema = 'proscience' 
                AND constraint_name = 'uk_nombre' 
                AND table_name = 'categorias');

SET @sqlstmt2 := IF(@exist2 > 0, 'ALTER TABLE categorias DROP CONSTRAINT uk_nombre', 'SELECT "Restricción uk_nombre no existe"');
PREPARE stmt2 FROM @sqlstmt2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Verificar si existe la restricción nueva (nombre + tipo_producto)
SET @exist_new := (SELECT COUNT(*) FROM information_schema.table_constraints 
                   WHERE constraint_schema = 'proscience' 
                   AND constraint_name = 'uk_nombre_tipo' 
                   AND table_name = 'categorias');

-- Crear la nueva restricción única compuesta si no existe
SET @sqlstmt3 := IF(@exist_new = 0, 
    'ALTER TABLE categorias ADD CONSTRAINT uk_nombre_tipo UNIQUE (nombre, tipo_producto)', 
    'SELECT "Restricción uk_nombre_tipo ya existe"');
PREPARE stmt3 FROM @sqlstmt3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SELECT 'Migración de restricción única de categorias completada' AS resultado;

