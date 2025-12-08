-- Migración: Agregar columna cantidad_stock a las tablas productos y materiales
-- Fecha: 2024

USE proscience;

-- Agregar columna cantidad_stock a la tabla productos
SET @exist_productos := (SELECT COUNT(*) FROM information_schema.columns 
                         WHERE table_schema = 'proscience' 
                         AND table_name = 'productos' 
                         AND column_name = 'cantidad_stock');

SET @sql_productos := IF(@exist_productos = 0, 
    'ALTER TABLE productos ADD COLUMN cantidad_stock DECIMAL(15,4) DEFAULT 0.0000', 
    'SELECT "Columna cantidad_stock ya existe en productos"');

PREPARE stmt FROM @sql_productos;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna cantidad_stock a la tabla materiales
SET @exist_materiales := (SELECT COUNT(*) FROM information_schema.columns 
                          WHERE table_schema = 'proscience' 
                          AND table_name = 'materiales' 
                          AND column_name = 'cantidad_stock');

SET @sql_materiales := IF(@exist_materiales = 0, 
    'ALTER TABLE materiales ADD COLUMN cantidad_stock DECIMAL(15,4) DEFAULT 0.0000', 
    'SELECT "Columna cantidad_stock ya existe en materiales"');

PREPARE stmt2 FROM @sql_materiales;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SELECT 'Migración de columnas cantidad_stock completada' AS resultado;

