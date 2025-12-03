DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ReporteStockBajo(
    IN p_umbral_materiales DECIMAL(15,4),
    IN p_umbral_productos DECIMAL(15,4)
)
BEGIN
    -- Materiales con stock bajo
    SELECT 
        'MATERIAL' AS tipo,
        m.id,
        m.codigo,
        m.nombre,
        m.cantidad_stock,
        m.unidad_medida,
        CASE 
            WHEN m.cantidad_stock IS NULL OR m.cantidad_stock = 0 THEN 'SIN STOCK'
            WHEN m.cantidad_stock < p_umbral_materiales THEN 'BAJO'
            ELSE 'NORMAL'
        END AS estado_stock
    FROM materiales m
    WHERE m.estado = 'ACTIVO'
      AND (m.cantidad_stock IS NULL 
           OR m.cantidad_stock = 0 
           OR m.cantidad_stock < p_umbral_materiales)
    
    UNION ALL
    
    -- Productos con stock bajo
    SELECT 
        'PRODUCTO' AS tipo,
        p.id,
        p.codigo,
        p.nombre,
        p.cantidad_stock,
        p.unidad_medida,
        CASE 
            WHEN p.cantidad_stock IS NULL OR p.cantidad_stock = 0 THEN 'SIN STOCK'
            WHEN p.cantidad_stock < p_umbral_productos THEN 'BAJO'
            ELSE 'NORMAL'
        END AS estado_stock
    FROM productos p
    WHERE p.estado = 'ACTIVO'
      AND (p.cantidad_stock IS NULL 
           OR p.cantidad_stock = 0 
           OR p.cantidad_stock < p_umbral_productos)
    ORDER BY tipo, estado_stock DESC, cantidad_stock ASC;
END$$

DELIMITER ;

