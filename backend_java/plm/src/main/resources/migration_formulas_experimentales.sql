-- Migración: Tablas para Fórmulas Experimentales y Bases de Datos Químicas
-- Fecha: 2024

USE proscience;

-- Tabla de fórmulas experimentales
CREATE TABLE IF NOT EXISTS formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    objetivo TEXT,
    rendimiento DECIMAL(10,4) DEFAULT 100.0 COMMENT 'Rendimiento en gramos',
    estado ENUM('disenada', 'en_revision', 'aprobada', 'en_prueba', 'prueba_aprobada', 'en_produccion', 'obsoleta') DEFAULT 'disenada',
    idea_id INT COMMENT 'Vinculada a ideas para seguimiento',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_idea_id (idea_id),
    INDEX idx_codigo (codigo),
    CONSTRAINT fk_formula_idea FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL,
    CONSTRAINT fk_formula_creador FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de versiones de fórmulas
CREATE TABLE IF NOT EXISTS formula_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula_id INT NOT NULL,
    version VARCHAR(20) NOT NULL,
    descripcion TEXT,
    justificacion TEXT,
    formula_data JSON COMMENT 'Datos completos de la fórmula en JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_formula_version (formula_id, version),
    CONSTRAINT fk_formula_version_formula FOREIGN KEY (formula_id) REFERENCES formulas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ingredientes de fórmula
CREATE TABLE IF NOT EXISTS formula_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula_id INT NOT NULL,
    material_id INT COMMENT 'Materia prima del inventario (opcional)',
    compound_id INT COMMENT 'Compuesto de BD química (opcional)',
    nombre VARCHAR(255) NOT NULL,
    cantidad DECIMAL(10,4) NOT NULL,
    unidad VARCHAR(50) NOT NULL DEFAULT 'g',
    porcentaje DECIMAL(5,2) NOT NULL,
    funcion VARCHAR(100) COMMENT 'Función del ingrediente (proteína, excipiente, etc.)',
    secuencia INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_formula_id (formula_id),
    INDEX idx_material_id (material_id),
    INDEX idx_compound_id (compound_id),
    CONSTRAINT fk_formula_ingredient_formula FOREIGN KEY (formula_id) REFERENCES formulas(id) ON DELETE CASCADE,
    CONSTRAINT fk_formula_ingredient_material FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE SET NULL,
    CONSTRAINT fk_formula_ingredient_compound FOREIGN KEY (compound_id) REFERENCES chemical_compounds(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de compuestos químicos (cache de bases de datos)
CREATE TABLE IF NOT EXISTS chemical_compounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    formula VARCHAR(100),
    molecular_weight DECIMAL(10,4),
    smiles TEXT,
    inchi TEXT,
    inchi_key VARCHAR(27) UNIQUE,
    cas_number VARCHAR(50),
    source ENUM('PubChem', 'ChEMBL', 'DrugBank', 'ZINC') NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    
    -- Propiedades fisicoquímicas
    log_p DECIMAL(6,2),
    log_s DECIMAL(6,2),
    hbd INT COMMENT 'Hydrogen bond donors',
    hba INT COMMENT 'Hydrogen bond acceptors',
    rotatable_bonds INT,
    tpsa DECIMAL(8,2) COMMENT 'Topological Polar Surface Area',
    solubility TEXT,
    stability TEXT,
    
    -- Propiedades biológicas
    bioactivity TEXT,
    mechanism_of_action TEXT,
    
    -- Disponibilidad
    purchasable BOOLEAN DEFAULT FALSE,
    vendor VARCHAR(255),
    price DECIMAL(10,2),
    
    -- Metadata
    additional_properties JSON,
    source_url TEXT,
    
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_formula (formula),
    INDEX idx_source (source, source_id),
    INDEX idx_inchi_key (inchi_key),
    INDEX idx_cas_number (cas_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

