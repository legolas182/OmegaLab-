-- Migración para actualizar la tabla ideas con los nuevos campos
-- Ejecutar este script si la tabla ideas ya existe

USE proscience;

-- Agregar nuevas columnas si no existen
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS objetivo TEXT AFTER prioridad,
ADD COLUMN IF NOT EXISTS producto_origen_id INT AFTER objetivo,
ADD COLUMN IF NOT EXISTS asignado_a INT AFTER producto_origen_id;

-- Modificar el enum de estado para incluir los nuevos estados
-- Nota: MySQL no permite modificar ENUM directamente, necesitamos recrear la columna
ALTER TABLE ideas 
MODIFY COLUMN estado ENUM('generada', 'en_revision', 'aprobada', 'en_prueba', 'prueba_aprobada', 'rechazada', 'en_produccion') DEFAULT 'generada';

-- Agregar índices si no existen
CREATE INDEX IF NOT EXISTS idx_producto_origen_id ON ideas(producto_origen_id);
CREATE INDEX IF NOT EXISTS idx_asignado_a ON ideas(asignado_a);

-- Agregar foreign keys si no existen
-- Primero eliminar si existen para evitar errores
SET @exist := (SELECT COUNT(*) FROM information_schema.table_constraints 
               WHERE constraint_schema = 'proscience' 
               AND constraint_name = 'fk_idea_producto_origen' 
               AND table_name = 'ideas');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE ideas DROP FOREIGN KEY fk_idea_producto_origen', 'SELECT "FK no existe"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.table_constraints 
               WHERE constraint_schema = 'proscience' 
               AND constraint_name = 'fk_idea_asignado' 
               AND table_name = 'ideas');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE ideas DROP FOREIGN KEY fk_idea_asignado', 'SELECT "FK no existe"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar foreign keys
ALTER TABLE ideas
ADD CONSTRAINT fk_idea_producto_origen FOREIGN KEY (producto_origen_id) REFERENCES productos(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_idea_asignado FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Actualizar estados antiguos a los nuevos valores
UPDATE ideas SET estado = 'generada' WHERE estado = 'borrador';
UPDATE ideas SET estado = 'en_revision' WHERE estado = 'en_revision';
UPDATE ideas SET estado = 'aprobada' WHERE estado = 'aprobada';
UPDATE ideas SET estado = 'rechazada' WHERE estado = 'rechazada';
UPDATE ideas SET estado = 'en_produccion' WHERE estado = 'convertida';

