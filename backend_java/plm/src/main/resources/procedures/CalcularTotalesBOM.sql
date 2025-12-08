DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS CalcularTotalesBOM(
    IN p_bom_id INT,
    OUT p_total_porcentaje DECIMAL(5,2),
    OUT p_total_cantidad DECIMAL(15,4),
    OUT p_num_items INT,
    OUT p_detalle TEXT
)
BEGIN
    SELECT 
        COALESCE(SUM(porcentaje), 0),
        COALESCE(SUM(cantidad), 0),
        COUNT(*)
    INTO 
        p_total_porcentaje,
        p_total_cantidad,
        p_num_items
    FROM bom_items
    WHERE bom_id = p_bom_id;
    
    SELECT GROUP_CONCAT(
        CONCAT(m.nombre, ': ', bi.cantidad, ' ', bi.unidad, ' (', bi.porcentaje, '%)')
        SEPARATOR '\n'
    )
    INTO p_detalle
    FROM bom_items bi
    INNER JOIN materiales m ON bi.material_id = m.id
    WHERE bi.bom_id = p_bom_id
    ORDER BY bi.secuencia;
END$$

DELIMITER ;

