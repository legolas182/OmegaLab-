# Stored Procedures

This directory contains stored procedures that are automatically created when the application starts.

## Available Procedures

### 1. ValidarPorcentajesBOM
Validates that BOM percentages sum to exactly 100%.

**Parameters:**
- `IN p_bom_id INT` - BOM ID to validate
- `OUT p_valido BOOLEAN` - Indicates if valid
- `OUT p_suma_total DECIMAL(5,2)` - Total sum of percentages
- `OUT p_mensaje VARCHAR(255)` - Descriptive message

**Usage:**
```sql
CALL ValidarPorcentajesBOM(1, @valido, @suma, @mensaje);
SELECT @valido, @suma, @mensaje;
```

### 2. VerificarStockProduccion
Verifies if there is sufficient stock of materials to produce a product.

**Parameters:**
- `IN p_producto_id INT` - Product ID
- `IN p_cantidad_producir DECIMAL(15,4)` - Quantity to produce
- `OUT p_disponible BOOLEAN` - Indicates if stock is sufficient
- `OUT p_mensaje TEXT` - Stock availability details

### 3. CalcularTotalesBOM
Calculates totals of percentages and quantities for a BOM.

**Parameters:**
- `IN p_bom_id INT` - BOM ID
- `OUT p_total_porcentaje DECIMAL(5,2)` - Sum of percentages
- `OUT p_total_cantidad DECIMAL(15,4)` - Sum of quantities
- `OUT p_num_items INT` - Number of items
- `OUT p_detalle TEXT` - Detail of each item

### 4. ActualizarStockProduccion
Updates material and product stock after production.

**Parameters:**
- `IN p_producto_id INT` - ID of produced product
- `IN p_cantidad_producida DECIMAL(15,4)` - Produced quantity
- `IN p_usuario_id INT` - ID of user performing the operation
- `OUT p_exito BOOLEAN` - Indicates if successful
- `OUT p_mensaje VARCHAR(500)` - Result message

### 5. ReporteStockBajo
Generates a report of materials and products with low stock.

**Parameters:**
- `IN p_umbral_materiales DECIMAL(15,4)` - Minimum threshold for materials
- `IN p_umbral_productos DECIMAL(15,4)` - Minimum threshold for products

**Returns:** ResultSet with low stock items

### 6. ObtenerHistorialBOM
Gets the complete version history of BOMs for a product.

**Parameters:**
- `IN p_producto_id INT` - Product ID

**Returns:** ResultSet with version history

### 7. ValidarIntegridadBOM
Validates data integrity of a BOM.

**Parameters:**
- `IN p_bom_id INT` - BOM ID
- `OUT p_valido BOOLEAN` - Indicates if valid
- `OUT p_errores TEXT` - List of errors found

## Notes

- Procedures are automatically created when the application starts
- If a procedure already exists, its creation is skipped
- SQL files must use `DELIMITER $$` for compatibility with MySQL Workbench
- Java code automatically removes DELIMITER when executing
