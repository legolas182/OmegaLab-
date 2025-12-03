DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ObtenerHistorialBOM(
    IN p_producto_id INT
)
BEGIN
    SELECT 
        b.id,
        b.version,
        b.estado,
        b.justificacion,
        u_creador.nombre AS creador,
        u_aprobador.nombre AS aprobador,
        b.approved_at,
        b.created_at,
        COUNT(bi.id) AS num_items,
        COALESCE(SUM(bi.porcentaje), 0) AS total_porcentaje
    FROM boms b
    LEFT JOIN usuarios u_creador ON b.created_by = u_creador.id
    LEFT JOIN usuarios u_aprobador ON b.approved_by = u_aprobador.id
    LEFT JOIN bom_items bi ON b.id = bi.bom_id
    WHERE b.producto_id = p_producto_id
    GROUP BY b.id, b.version, b.estado, b.justificacion, 
             u_creador.nombre, u_aprobador.nombre, 
             b.approved_at, b.created_at
    ORDER BY b.version DESC;
END$$

DELIMITER ;

