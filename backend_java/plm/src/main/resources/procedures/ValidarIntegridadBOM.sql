DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ValidarIntegridadBOM(
    IN p_bom_id INT,
    OUT p_valido BOOLEAN,
    OUT p_errores TEXT
)
BEGIN
    DECLARE v_tiene_items BOOLEAN;
    DECLARE v_tiene_producto BOOLEAN;
    DECLARE v_errores TEXT DEFAULT '';
    
    -- Verificar que tenga items
    SELECT COUNT(*) > 0 INTO v_tiene_items
    FROM bom_items
    WHERE bom_id = p_bom_id;
    
    IF NOT v_tiene_items THEN
        SET v_errores = CONCAT(v_errores, 'El BOM no tiene items\n');
    END IF;
    
    -- Verificar que tenga producto asociado
    SELECT COUNT(*) > 0 INTO v_tiene_producto
    FROM boms
    WHERE id = p_bom_id AND producto_id IS NOT NULL;
    
    IF NOT v_tiene_producto THEN
        SET v_errores = CONCAT(v_errores, 'El BOM no tiene producto asociado\n');
    END IF;
    
    -- Verificar que todos los items tengan material válido
    IF EXISTS (
        SELECT 1 FROM bom_items bi
        LEFT JOIN materiales m ON bi.material_id = m.id
        WHERE bi.bom_id = p_bom_id 
          AND (m.id IS NULL OR m.estado != 'ACTIVO')
    ) THEN
        SET v_errores = CONCAT(v_errores, 'El BOM tiene items con materiales inválidos o inactivos\n');
    END IF;
    
    IF v_errores = '' THEN
        SET p_valido = TRUE;
        SET p_errores = 'BOM válido';
    ELSE
        SET p_valido = FALSE;
        SET p_errores = v_errores;
    END IF;
END$$

DELIMITER ;

