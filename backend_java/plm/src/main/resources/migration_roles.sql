-- Script de migración para actualizar roles antiguos a los nuevos roles
-- Ejecutar este script en la base de datos después de actualizar el código

USE proscience;

-- Desactivar modo seguro temporalmente (solo para esta sesión)
SET SQL_SAFE_UPDATES = 0;

-- Actualizar roles antiguos a los nuevos roles
-- ADMIN -> ADMINISTRADOR
UPDATE usuarios 
SET rol = 'ADMINISTRADOR' 
WHERE (rol = 'admin' OR rol = 'ADMIN') AND id > 0;

-- QA_MANAGER -> SUPERVISOR_QA
UPDATE usuarios 
SET rol = 'SUPERVISOR_QA' 
WHERE (rol = 'qa_manager' OR rol = 'QA_MANAGER') AND id > 0;

-- SUPERVISOR -> SUPERVISOR_CALIDAD (asumiendo que los supervisores son de calidad)
-- Si hay supervisores de producción, ajustar según necesidad
UPDATE usuarios 
SET rol = 'SUPERVISOR_CALIDAD' 
WHERE (rol = 'supervisor' OR rol = 'SUPERVISOR') AND id > 0;

-- ANALISTA -> ANALISTA_LABORATORIO
UPDATE usuarios 
SET rol = 'ANALISTA_LABORATORIO' 
WHERE (rol = 'analista' OR rol = 'ANALISTA') AND id > 0;

-- USUARIO -> ANALISTA_LABORATORIO (por defecto, ajustar según necesidad)
UPDATE usuarios 
SET rol = 'ANALISTA_LABORATORIO' 
WHERE (rol = 'usuario' OR rol = 'USUARIO') AND id > 0;

-- Reactivar modo seguro
SET SQL_SAFE_UPDATES = 1;

-- Verificar que todos los usuarios tengan un rol válido
SELECT id, email, nombre, rol, estado 
FROM usuarios 
WHERE rol NOT IN ('ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD', 'ANALISTA_LABORATORIO');

