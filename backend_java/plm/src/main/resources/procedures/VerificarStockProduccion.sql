DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS VerificarStockProduccion(
    IN p_producto_id INT,
    IN p_cantidad_producir DECIMAL(15,4),
    OUT p_disponible BOOLEAN,
    OUT p_mensaje TEXT
)
BEGIN
    DECLARE v_material_id INT;
    DECLARE v_cantidad_necesaria DECIMAL(15,4);
    DECLARE v_stock_disponible DECIMAL(15,4);
    DECLARE v_unidad VARCHAR(50);
    DECLARE v_material_nombre VARCHAR(255);
    DECLARE v_faltante TEXT DEFAULT '';
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur_materiales CURSOR FOR
        SELECT 
            bi.material_id,
            bi.cantidad,
            bi.unidad,
            m.nombre,
            m.cantidad_stock
        FROM bom_items bi
        INNER JOIN boms b ON bi.bom_id = b.id
        INNER JOIN materiales m ON bi.material_id = m.id
        WHERE b.producto_id = p_producto_id
          AND b.estado = 'APROBADO'
        ORDER BY bi.secuencia;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET p_disponible = TRUE;
    SET p_mensaje = '';
    
    OPEN cur_materiales;
    
    read_loop: LOOP
        FETCH cur_materiales INTO 
            v_material_id, 
            v_cantidad_necesaria, 
            v_unidad, 
            v_material_nombre,
            v_stock_disponible;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Convertir unidades si es necesario
        -- Si la unidad es 'g' y el stock está en 'kg', convertir
        IF v_unidad = 'g' AND v_stock_disponible IS NOT NULL THEN
            SET v_cantidad_necesaria = v_cantidad_necesaria / 1000.0;
        END IF;
        
        -- Calcular cantidad total necesaria para la producción
        SET v_cantidad_necesaria = v_cantidad_necesaria * p_cantidad_producir;
        
        IF v_stock_disponible IS NULL OR v_stock_disponible < v_cantidad_necesaria THEN
            SET p_disponible = FALSE;
            SET v_faltante = CONCAT(
                v_faltante,
                v_material_nombre, 
                ': Necesario ', v_cantidad_necesaria, 
                ', Disponible ', COALESCE(v_stock_disponible, 0),
                '\n'
            );
        END IF;
    END LOOP;
    
    CLOSE cur_materiales;
    
    IF p_disponible THEN
        SET p_mensaje = 'Stock suficiente para la producción';
    ELSE
        SET p_mensaje = CONCAT('Stock insuficiente:\n', v_faltante);
    END IF;
END$$

DELIMITER ;

