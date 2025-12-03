DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ActualizarStockProduccion(
    IN p_producto_id INT,
    IN p_cantidad_producida DECIMAL(15,4),
    IN p_usuario_id INT,
    OUT p_exito BOOLEAN,
    OUT p_mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_material_id INT;
    DECLARE v_cantidad_necesaria DECIMAL(15,4);
    DECLARE v_stock_actual DECIMAL(15,4);
    DECLARE v_unidad VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_error TEXT DEFAULT '';
    
    DECLARE cur_materiales CURSOR FOR
        SELECT 
            bi.material_id,
            bi.cantidad,
            bi.unidad,
            m.cantidad_stock
        FROM bom_items bi
        INNER JOIN boms b ON bi.bom_id = b.id
        INNER JOIN materiales m ON bi.material_id = m.id
        WHERE b.producto_id = p_producto_id
          AND b.estado = 'APROBADO'
        ORDER BY bi.secuencia;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_exito = FALSE;
        SET p_mensaje = CONCAT('Error al actualizar stock: ', SQLERRM);
    END;
    
    START TRANSACTION;
    
    -- Descontar materiales del BOM
    OPEN cur_materiales;
    
    read_loop: LOOP
        FETCH cur_materiales INTO 
            v_material_id, 
            v_cantidad_necesaria, 
            v_unidad,
            v_stock_actual;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Convertir unidades si es necesario
        IF v_unidad = 'g' THEN
            SET v_cantidad_necesaria = v_cantidad_necesaria / 1000.0; -- g a kg
        END IF;
        
        SET v_cantidad_necesaria = v_cantidad_necesaria * p_cantidad_producida;
        
        IF v_stock_actual < v_cantidad_necesaria THEN
            SET v_error = CONCAT(v_error, 'Stock insuficiente para material ID: ', v_material_id, '\n');
        ELSE
            UPDATE materiales 
            SET cantidad_stock = cantidad_stock - v_cantidad_necesaria
            WHERE id = v_material_id;
        END IF;
    END LOOP;
    
    CLOSE cur_materiales;
    
    -- Agregar productos producidos al stock
    UPDATE productos
    SET cantidad_stock = cantidad_stock + p_cantidad_producida
    WHERE id = p_producto_id;
    
    IF v_error != '' THEN
        ROLLBACK;
        SET p_exito = FALSE;
        SET p_mensaje = v_error;
    ELSE
        COMMIT;
        SET p_exito = TRUE;
        SET p_mensaje = CONCAT('Stock actualizado correctamente. Producción: ', p_cantidad_producida);
    END IF;
END$$

DELIMITER ;

