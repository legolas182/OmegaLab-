-- Base de datos para sistema PLM/LIMS
-- Proscience Lab

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS proscience CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE proscience;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'supervisor_qa', 'supervisor_calidad', 'analista_laboratorio') DEFAULT 'analista_laboratorio',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo_producto ENUM('producto_terminado', 'materia_prima', 'componente') NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_tipo_producto (tipo_producto),
    INDEX idx_estado (estado),
    UNIQUE KEY uk_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos terminados
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
<<<<<<< HEAD
=======
    categoria VARCHAR(100),
>>>>>>> origin/main
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'un',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_categoria_id (categoria_id),
<<<<<<< HEAD
=======
    INDEX idx_categoria (categoria),
>>>>>>> origin/main
    INDEX idx_estado (estado),
    UNIQUE KEY uk_codigo (codigo),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de materiales (materias primas)
CREATE TABLE IF NOT EXISTS materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
<<<<<<< HEAD
=======
    categoria VARCHAR(100),
>>>>>>> origin/main
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'kg',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_categoria_id (categoria_id),
<<<<<<< HEAD
=======
    INDEX idx_categoria (categoria),
>>>>>>> origin/main
    INDEX idx_estado (estado),
    UNIQUE KEY uk_codigo (codigo),
    CONSTRAINT fk_material_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de BOMs (Bill of Materials)
CREATE TABLE IF NOT EXISTS boms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    version VARCHAR(20) NOT NULL,
    estado ENUM('borrador', 'aprobado', 'obsoleto') DEFAULT 'borrador',
    justificacion TEXT,
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_producto_id (producto_id),
    INDEX idx_estado (estado),
    INDEX idx_version (version),
    UNIQUE KEY uk_producto_version (producto_id, version),
    CONSTRAINT fk_bom_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT fk_bom_creador FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_bom_aprobador FOREIGN KEY (approved_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items de BOM
CREATE TABLE IF NOT EXISTS bom_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bom_id INT NOT NULL,
    material_id INT NOT NULL,
    cantidad DECIMAL(15,4) NOT NULL,
    unidad VARCHAR(50) NOT NULL DEFAULT 'mg',
    porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    secuencia INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bom_id (bom_id),
    INDEX idx_material_id (material_id),
    INDEX idx_secuencia (secuencia),
    CONSTRAINT fk_bom_item_bom FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE CASCADE,
    CONSTRAINT fk_bom_item_material FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<<<<<<< HEAD
-- Tabla de ideas
CREATE TABLE IF NOT EXISTS ideas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    detalles_ia LONGTEXT,
    pruebas_requeridas TEXT,
    categoria_id INT,
    prioridad VARCHAR(20),
    objetivo TEXT,
    producto_origen_id INT,
    asignado_a INT,
    estado ENUM('generada', 'en_revision', 'aprobada', 'en_prueba', 'prueba_aprobada', 'rechazada', 'en_produccion') DEFAULT 'generada',
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_prioridad (prioridad),
    INDEX idx_created_by (created_by),
    INDEX idx_producto_origen_id (producto_origen_id),
    INDEX idx_asignado_a (asignado_a),
    CONSTRAINT fk_idea_creador FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_idea_aprobador FOREIGN KEY (approved_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_idea_producto_origen FOREIGN KEY (producto_origen_id) REFERENCES productos(id) ON DELETE SET NULL,
    CONSTRAINT fk_idea_asignado FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_idea_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pruebas de laboratorio
CREATE TABLE IF NOT EXISTS pruebas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idea_id INT NOT NULL,
    codigo_muestra VARCHAR(100) NOT NULL,
    tipo_prueba VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'en_proceso', 'completada', 'oos', 'rechazada') DEFAULT 'pendiente',
    fecha_muestreo TIMESTAMP NULL,
    fecha_inicio TIMESTAMP NULL,
    fecha_fin TIMESTAMP NULL,
    resultado TEXT,
    observaciones TEXT,
    equipos_utilizados TEXT,
    pruebas_requeridas TEXT,
    analista_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_idea_id (idea_id),
    INDEX idx_analista_id (analista_id),
    INDEX idx_estado (estado),
    INDEX idx_codigo_muestra (codigo_muestra),
    CONSTRAINT fk_prueba_idea FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    CONSTRAINT fk_prueba_analista FOREIGN KEY (analista_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de resultados analíticos de pruebas
CREATE TABLE IF NOT EXISTS resultados_prueba (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prueba_id INT NOT NULL,
    parametro VARCHAR(255) NOT NULL,
    especificacion VARCHAR(255),
    resultado VARCHAR(255) NOT NULL,
    unidad VARCHAR(50),
    cumple_especificacion BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prueba_id (prueba_id),
    CONSTRAINT fk_resultado_prueba FOREIGN KEY (prueba_id) REFERENCES pruebas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

=======
>>>>>>> origin/main
