DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ValidarPorcentajesBOM(
    IN p_bom_id INT,
    OUT p_valido BOOLEAN,
    OUT p_suma_total DECIMAL(5,2),
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_suma DECIMAL(5,2);
    
    SELECT COALESCE(SUM(porcentaje), 0) INTO v_suma
    FROM bom_items
    WHERE bom_id = p_bom_id;
    
    SET p_suma_total = v_suma;
    
    IF ABS(v_suma - 100.00) <= 0.01 THEN
        SET p_valido = TRUE;
        SET p_mensaje = 'Los porcentajes suman correctamente 100%';
    ELSE
        SET p_valido = FALSE;
        SET p_mensaje = CONCAT('Los porcentajes suman ', v_suma, '%. Debe ser exactamente 100%');
    END IF;
END$$

DELIMITER ;

