# PT-MCBD-01.Manual de Configuración BD (Plantilla)

## Proscience Lab - PLM/LIMS
v1.0

**HISTORIAL DE REVISIÓN**

| Versión | Fecha Elaboración | Responsable Elaboración | Fecha Aprobación | Responsable Aprobación |
| --- | --- | --- | --- | --- |
| 1.0 | 10/01/2025 | Sistema |  |  |
|  |  |  |  |  |

**CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR**

| **VERSIÓN** | **MODIFICACIÓN RESPECTO VERSIÓN ANTERIOR** |
| --- | --- |
| 1.0 | Documento inicial  |
|  |  |
|  |  |

## Tabla de Contenido.

1. [Introducción](#1-introducción)
2. [Alcance](#2-alcance)
3. [Modelo Entidad Relación (MER)](#3-modelo-entidad-relación-mer)
4. [Diccionario de Datos](#4-diccionario-de-datos)
5. [Modelo Relacional o Estructura de Documentos](#5-modelo-relacional-o-estructura-de-documentos)
6. [Justificación Sistema gestor de bases de datos seleccionado](#6-justificación-sistema-gestor-de-bases-de-datos-seleccionado)
7. [Requisitos de configuración](#7-requisitos-de-configuración)
8. [Scripts](#8-scripts)
9. [Configuración y ejecución de la base de datos](#9-configuración-y-ejecución-de-la-base-de-datos)
10. [Otras consideraciones](#10-otras-consideraciones)

## 1. Introducción

Este documento describe la configuración y estructura de la base de datos para el sistema **Proscience Lab - PLM/LIMS** (Product Lifecycle Management / Laboratory Information Management System).

> 💡 Nota importante: El sistema está diseñado para gestionar el ciclo de vida de productos nutracéuticos, desde la generación de ideas hasta la producción, incluyendo la gestión de materiales, BOMs (Bill of Materials), pruebas de laboratorio y trazabilidad completa.

La base de datos ha sido diseñada siguiendo principios de normalización (3NF) para garantizar la integridad de los datos, eliminar redundancias y facilitar el mantenimiento.

## 2. Alcance

Este manual cubre los aspectos necesarios para configurar la base de datos del proyecto **Proscience Lab - PLM/LIMS**. Incluye:

- ✅ **Creación y configuración de la base de datos**
- ✅ **Definición del modelo entidad-relación y estructura de datos**
- ✅ **Requisitos y justificación del sistema gestor de bases de datos (SGBD) seleccionado**
- ✅ **Instrucciones para la instalación y configuración del SGBD**
- ✅ **Diccionario completo de datos con todas las tablas y campos**
- ✅ **Scripts SQL para creación y configuración inicial**
- ✅ **Stored Procedures para operaciones complejas**

Este documento aplica a todas las fases de desarrollo y despliegue de la base de datos para el proyecto.

## 3. Modelo Entidad Relación (MER)

El modelo entidad-relación del sistema Proscience Lab - PLM/LIMS está compuesto por las siguientes entidades principales:

**Entidades Principales:**
- **Usuarios**: Gestión de usuarios del sistema con roles y permisos
- **Categorías**: Clasificación de productos y materiales
- **Productos**: Productos terminados del inventario
- **Materiales**: Materias primas utilizadas en la producción
- **BOMs**: Listas de materiales (Bill of Materials) con versionado
- **BOM Items**: Componentes individuales de cada BOM
- **Ideas**: Ideas de productos generadas por IA o usuarios
- **Pruebas**: Pruebas de laboratorio asociadas a ideas
- **Resultados de Prueba**: Resultados analíticos detallados de cada prueba

**Relaciones Principales:**
- Un usuario puede crear múltiples BOMs, Ideas y Pruebas
- Un producto puede tener múltiples versiones de BOM
- Un BOM contiene múltiples items (materiales)
- Una idea puede tener múltiples pruebas asociadas
- Una prueba puede tener múltiples resultados analíticos
- Productos y Materiales pertenecen a categorías

## 4. Diccionario de Datos

El diccionario de datos proporciona una descripción completa de cada tabla y campo en la base de datos.

---

### **1. Usuarios (usuarios)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del usuario. Auto-incremental. |
| `email` | `VARCHAR(255)` (UNIQUE, NOT NULL) | Correo electrónico del usuario. Debe ser único. |
| `password` | `VARCHAR(255)` (NOT NULL) | Contraseña del usuario (encriptada con BCrypt). |
| `nombre` | `VARCHAR(255)` (NOT NULL) | Nombre completo del usuario. |
| `rol` | `ENUM('administrador', 'supervisor_qa', 'supervisor_calidad', 'analista_laboratorio')` (DEFAULT 'analista_laboratorio') | Rol del usuario en el sistema. |
| `estado` | `ENUM('activo', 'inactivo')` (DEFAULT 'activo') | Estado del usuario (activo/inactivo). |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación del registro. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_email` en `email`
- `idx_estado` en `estado`

---

### **2. Categorías (categorias)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único de la categoría. |
| `nombre` | `VARCHAR(100)` (UNIQUE, NOT NULL) | Nombre de la categoría. Debe ser único. |
| `descripcion` | `TEXT` | Descripción detallada de la categoría. |
| `tipo_producto` | `ENUM('producto_terminado', 'materia_prima', 'componente')` (NOT NULL) | Tipo de producto al que aplica la categoría. |
| `estado` | `ENUM('activo', 'inactivo')` (DEFAULT 'activo') | Estado de la categoría. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_nombre` en `nombre`
- `idx_tipo_producto` en `tipo_producto`
- `idx_estado` en `estado`
- `uk_nombre` (UNIQUE) en `nombre`

---

### **3. Productos (productos)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del producto. |
| `codigo` | `VARCHAR(100)` (UNIQUE, NOT NULL) | Código único del producto. |
| `nombre` | `VARCHAR(255)` (NOT NULL) | Nombre del producto terminado. |
| `descripcion` | `TEXT` | Descripción detallada del producto. |
| `categoria_id` | `INT` (FOREIGN KEY) | Referencia a la categoría del producto. |
| `unidad_medida` | `VARCHAR(50)` (NOT NULL, DEFAULT 'un') | Unidad de medida del producto (unidades, kg, etc.). |
| `estado` | `ENUM('activo', 'inactivo')` (DEFAULT 'activo') | Estado del producto. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_codigo` en `codigo`
- `idx_categoria_id` en `categoria_id`
- `idx_estado` en `estado`
- `uk_codigo` (UNIQUE) en `codigo`

**Foreign Keys:**
- `fk_producto_categoria` → `categorias(id)` ON DELETE SET NULL

---

### **4. Materiales (materiales)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del material. |
| `codigo` | `VARCHAR(100)` (UNIQUE, NOT NULL) | Código único del material. |
| `nombre` | `VARCHAR(255)` (NOT NULL) | Nombre de la materia prima. |
| `descripcion` | `TEXT` | Descripción detallada del material. |
| `categoria_id` | `INT` (FOREIGN KEY) | Referencia a la categoría del material. |
| `unidad_medida` | `VARCHAR(50)` (NOT NULL, DEFAULT 'kg') | Unidad de medida del material. |
| `estado` | `ENUM('activo', 'inactivo')` (DEFAULT 'activo') | Estado del material. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_codigo` en `codigo`
- `idx_categoria_id` en `categoria_id`
- `idx_estado` en `estado`
- `uk_codigo` (UNIQUE) en `codigo`

**Foreign Keys:**
- `fk_material_categoria` → `categorias(id)` ON DELETE SET NULL

---

### **5. BOMs (boms)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del BOM. |
| `producto_id` | `INT` (NOT NULL, FOREIGN KEY) | Referencia al producto asociado. |
| `version` | `VARCHAR(20)` (NOT NULL) | Versión del BOM (ej: "1.0", "2.1"). |
| `estado` | `ENUM('borrador', 'aprobado', 'obsoleto')` (DEFAULT 'borrador') | Estado del BOM. |
| `justificacion` | `TEXT` | Justificación de cambios en el BOM. |
| `created_by` | `INT` (FOREIGN KEY) | Usuario que creó el BOM. |
| `approved_by` | `INT` (FOREIGN KEY) | Usuario que aprobó el BOM. |
| `approved_at` | `TIMESTAMP` (NULL) | Fecha y hora de aprobación. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_producto_id` en `producto_id`
- `idx_estado` en `estado`
- `idx_version` en `version`
- `uk_producto_version` (UNIQUE) en `(producto_id, version)`

**Foreign Keys:**
- `fk_bom_producto` → `productos(id)` ON DELETE CASCADE
- `fk_bom_creador` → `usuarios(id)` ON DELETE SET NULL
- `fk_bom_aprobador` → `usuarios(id)` ON DELETE SET NULL

---

### **6. BOM Items (bom_items)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del item. |
| `bom_id` | `INT` (NOT NULL, FOREIGN KEY) | Referencia al BOM padre. |
| `material_id` | `INT` (NOT NULL, FOREIGN KEY) | Referencia al material utilizado. |
| `cantidad` | `DECIMAL(15,4)` (NOT NULL) | Cantidad del material requerida. |
| `unidad` | `VARCHAR(50)` (NOT NULL, DEFAULT 'mg') | Unidad de medida de la cantidad. |
| `porcentaje` | `DECIMAL(5,2)` (NOT NULL, DEFAULT 0.00) | Porcentaje del material en el BOM. |
| `secuencia` | `INT` (NOT NULL, DEFAULT 0) | Orden de secuencia del item en el BOM. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |

**Índices:**
- `idx_bom_id` en `bom_id`
- `idx_material_id` en `material_id`
- `idx_secuencia` en `secuencia`

**Foreign Keys:**
- `fk_bom_item_bom` → `boms(id)` ON DELETE CASCADE
- `fk_bom_item_material` → `materiales(id)` ON DELETE CASCADE

---

### **7. Ideas (ideas)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único de la idea. |
| `titulo` | `VARCHAR(255)` (NOT NULL) | Título de la idea de producto. |
| `descripcion` | `TEXT` | Descripción general de la idea. |
| `detalles_ia` | `LONGTEXT` | Detalles generados por IA (BOM modificado, escenarios, etc.). |
| `pruebas_requeridas` | `TEXT` | Lista de pruebas requeridas generadas por IA. |
| `categoria_id` | `INT` (FOREIGN KEY) | Referencia a la categoría de la idea. |
| `prioridad` | `VARCHAR(20)` | Prioridad de la idea (alta, media, baja). |
| `objetivo` | `TEXT` | Objetivo de la idea (ej: "proteína para diabéticos"). |
| `producto_origen_id` | `INT` (FOREIGN KEY) | Producto del inventario que se analizó. |
| `asignado_a` | `INT` (FOREIGN KEY) | Analista asignado para realizar pruebas. |
| `estado` | `ENUM('generada', 'en_revision', 'aprobada', 'en_prueba', 'prueba_aprobada', 'rechazada', 'en_produccion')` (DEFAULT 'generada') | Estado del flujo de la idea. |
| `created_by` | `INT` (FOREIGN KEY) | Usuario que creó la idea. |
| `approved_by` | `INT` (FOREIGN KEY) | Usuario que aprobó la idea. |
| `approved_at` | `TIMESTAMP` (NULL) | Fecha y hora de aprobación. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_estado` en `estado`
- `idx_categoria_id` en `categoria_id`
- `idx_prioridad` en `prioridad`
- `idx_created_by` en `created_by`
- `idx_producto_origen_id` en `producto_origen_id`
- `idx_asignado_a` en `asignado_a`

**Foreign Keys:**
- `fk_idea_creador` → `usuarios(id)` ON DELETE SET NULL
- `fk_idea_aprobador` → `usuarios(id)` ON DELETE SET NULL
- `fk_idea_producto_origen` → `productos(id)` ON DELETE SET NULL
- `fk_idea_asignado` → `usuarios(id)` ON DELETE SET NULL
- `fk_idea_categoria` → `categorias(id)` ON DELETE SET NULL

---

### **8. Pruebas (pruebas)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único de la prueba. |
| `idea_id` | `INT` (NOT NULL, FOREIGN KEY) | Referencia a la idea asociada. |
| `codigo_muestra` | `VARCHAR(100)` (NOT NULL) | Código único de la muestra. |
| `tipo_prueba` | `VARCHAR(100)` (NOT NULL) | Tipo de prueba de laboratorio. |
| `descripcion` | `TEXT` | Descripción de la prueba. |
| `estado` | `ENUM('pendiente', 'en_proceso', 'completada', 'oos', 'rechazada')` (DEFAULT 'pendiente') | Estado de la prueba. |
| `fecha_muestreo` | `TIMESTAMP` (NULL) | Fecha y hora del muestreo. |
| `fecha_inicio` | `TIMESTAMP` (NULL) | Fecha y hora de inicio de la prueba. |
| `fecha_fin` | `TIMESTAMP` (NULL) | Fecha y hora de finalización de la prueba. |
| `resultado` | `TEXT` | Resultado general de la prueba. |
| `observaciones` | `TEXT` | Observaciones adicionales. |
| `equipos_utilizados` | `TEXT` | Equipos utilizados en la prueba. |
| `pruebas_requeridas` | `TEXT` | Lista de pruebas requeridas. |
| `analista_id` | `INT` (NOT NULL, FOREIGN KEY) | Analista responsable de la prueba. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |
| `updated_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) | Fecha y hora de última actualización. |

**Índices:**
- `idx_idea_id` en `idea_id`
- `idx_analista_id` en `analista_id`
- `idx_estado` en `estado`
- `idx_codigo_muestra` en `codigo_muestra`

**Foreign Keys:**
- `fk_prueba_idea` → `ideas(id)` ON DELETE CASCADE
- `fk_prueba_analista` → `usuarios(id)` ON DELETE CASCADE

---

### **9. Resultados de Prueba (resultados_prueba)**

| Campo | Tipo de Datos | Descripción |
| --- | --- | --- |
| `id` | `INT` (AUTO_INCREMENT, PRIMARY KEY) | Identificador único del resultado. |
| `prueba_id` | `INT` (NOT NULL, FOREIGN KEY) | Referencia a la prueba asociada. |
| `parametro` | `VARCHAR(255)` (NOT NULL) | Nombre del parámetro analizado. |
| `especificacion` | `VARCHAR(255)` | Especificación del parámetro. |
| `resultado` | `VARCHAR(255)` (NOT NULL) | Valor del resultado obtenido. |
| `unidad` | `VARCHAR(50)` | Unidad de medida del resultado. |
| `cumple_especificacion` | `BOOLEAN` (DEFAULT TRUE) | Indica si cumple con la especificación. |
| `observaciones` | `TEXT` | Observaciones adicionales del resultado. |
| `created_at` | `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP) | Fecha y hora de creación. |

**Índices:**
- `idx_prueba_id` en `prueba_id`

**Foreign Keys:**
- `fk_resultado_prueba` → `pruebas(id)` ON DELETE CASCADE

---

## 5. Modelo Relacional o Estructura de Documentos

### **Relaciones Entre Tablas**

#### **Relaciones Uno a Muchos (1:N)**

1. **Usuarios → BOMs**
   - Un usuario puede crear múltiples BOMs (`created_by`)
   - Un usuario puede aprobar múltiples BOMs (`approved_by`)
   - Implementación: `boms.created_by` y `boms.approved_by` → `usuarios.id`

2. **Usuarios → Ideas**
   - Un usuario puede crear múltiples ideas (`created_by`)
   - Un usuario puede aprobar múltiples ideas (`approved_by`)
   - Un usuario puede tener múltiples ideas asignadas (`asignado_a`)
   - Implementación: `ideas.created_by`, `ideas.approved_by`, `ideas.asignado_a` → `usuarios.id`

3. **Usuarios → Pruebas**
   - Un usuario (analista) puede realizar múltiples pruebas
   - Implementación: `pruebas.analista_id` → `usuarios.id`

4. **Categorías → Productos**
   - Una categoría puede contener múltiples productos
   - Implementación: `productos.categoria_id` → `categorias.id`

5. **Categorías → Materiales**
   - Una categoría puede contener múltiples materiales
   - Implementación: `materiales.categoria_id` → `categorias.id`

6. **Categorías → Ideas**
   - Una categoría puede tener múltiples ideas
   - Implementación: `ideas.categoria_id` → `categorias.id`

7. **Productos → BOMs**
   - Un producto puede tener múltiples versiones de BOM
   - Implementación: `boms.producto_id` → `productos.id`

8. **Productos → Ideas**
   - Un producto puede ser origen de múltiples ideas
   - Implementación: `ideas.producto_origen_id` → `productos.id`

9. **BOMs → BOM Items**
   - Un BOM contiene múltiples items (materiales)
   - Implementación: `bom_items.bom_id` → `boms.id`

10. **Materiales → BOM Items**
    - Un material puede aparecer en múltiples BOMs
    - Implementación: `bom_items.material_id` → `materiales.id`

11. **Ideas → Pruebas**
    - Una idea puede tener múltiples pruebas asociadas
    - Implementación: `pruebas.idea_id` → `ideas.id`

12. **Pruebas → Resultados de Prueba**
    - Una prueba puede tener múltiples resultados analíticos
    - Implementación: `resultados_prueba.prueba_id` → `pruebas.id`

#### **Restricciones de Integridad Referencial**

- **ON DELETE CASCADE**: Se aplica cuando la eliminación del registro padre debe eliminar automáticamente los registros hijos:
  - BOMs → BOM Items
  - Ideas → Pruebas
  - Pruebas → Resultados de Prueba

- **ON DELETE SET NULL**: Se aplica cuando la eliminación del registro padre debe establecer NULL en la clave foránea:
  - Usuarios → BOMs (created_by, approved_by)
  - Usuarios → Ideas (created_by, approved_by, asignado_a)
  - Categorías → Productos, Materiales, Ideas
  - Productos → Ideas (producto_origen_id)

#### **Restricciones Únicas**

- `usuarios.email`: Debe ser único
- `categorias.nombre`: Debe ser único
- `productos.codigo`: Debe ser único
- `materiales.codigo`: Debe ser único
- `boms(producto_id, version)`: La combinación debe ser única (un producto no puede tener dos BOMs con la misma versión)

---

## 6. Justificación Sistema gestor de bases de datos seleccionado

**Sistema Gestor de Bases de Datos Seleccionado**: MySQL 8.0

**Justificación**:

- **Escalabilidad**: MySQL permite manejar grandes volúmenes de datos y escalar con facilidad, tanto vertical como horizontalmente. Soporta particionamiento y replicación.
- **Costo**: MySQL es una solución de código abierto con opciones comerciales, adecuada para proyectos de distintos tamaños. La versión Community Edition es gratuita.
- **Rendimiento**: Ofrece un alto rendimiento en transacciones y consultas, con optimizaciones para aplicaciones web y empresariales.
- **Comunidad**: Amplio soporte y documentación a través de una comunidad activa y recursos extensos.
- **Compatibilidad**: Excelente compatibilidad con frameworks Java/Spring Boot utilizados en el proyecto.
- **Características Avanzadas**: Soporte para stored procedures, triggers, vistas, índices avanzados y transacciones ACID.
- **UTF-8 Nativo**: Soporte completo para caracteres UTF-8 (utf8mb4) necesario para datos en español y caracteres especiales.

**Comparación con Otros SGBD**:

| **SGBD** | **Escalabilidad** | **Costo** | **Rendimiento** | **Soporte** | **Compatibilidad Java** |
| --- | --- | --- | --- | --- | --- |
| MySQL 8.0 | Alta | Gratuito / Comercial | Alto | Excelente | Excelente |
| PostgreSQL | Muy Alta | Gratuito | Muy Alto | Excelente | Excelente |
| Oracle DB | Muy Alta | Comercial | Muy Alto | Excelente | Excelente |
| SQL Server | Alta | Comercial | Alto | Excelente | Excelente |
| MongoDB | Muy Alta | Gratuito / Comercial | Alto (NoSQL) | Excelente | Buena |

**Razones de Selección sobre PostgreSQL**:
- Mayor familiaridad del equipo con MySQL
- Mejor integración con herramientas de desarrollo existentes
- Menor complejidad de configuración inicial
- Amplia adopción en la industria para aplicaciones similares

---

## 7. Requisitos de Configuración

**Herramientas Necesarias**:

- **Motor de Base de Datos**: MySQL 8.0 o superior
- **Cliente de Base de Datos**: MySQL Workbench 8.0 o superior, o cliente de línea de comandos
- **Servidor**: Windows 10/11 o superior / Linux Ubuntu 20.04 o superior / macOS 10.15 o superior
- **Aplicación Backend**: Java 17 o superior, Spring Boot 3.x

**Configuración Recomendada**:

- **Puertos**: Usar el puerto por defecto 3306 para MySQL
- **Espacio en Disco**: Al menos 20 GB disponibles para datos y copias de seguridad
- **Memoria RAM**: Mínimo 4 GB para el servidor MySQL (recomendado 8 GB o más)
- **Charset**: UTF-8 (utf8mb4) para soporte completo de caracteres especiales
- **Timezone**: Configurar timezone según ubicación (ej: America/Bogota)

**Variables de Entorno Requeridas**:

- `MYSQL_ROOT_PASSWORD`: Contraseña del usuario root (en producción usar variables de entorno seguras)
- `MYSQL_DATABASE`: Nombre de la base de datos (proscience)
- `MYSQL_USER`: Usuario de la aplicación (opcional)
- `MYSQL_PASSWORD`: Contraseña del usuario de la aplicación (opcional)

---

## 8. Scripts

### **Paso 1: Crear la Base de Datos**

Primero, crea la base de datos `proscience` en MySQL:

```sql
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS proscience CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos creada
USE proscience;
```

### **Paso 2: Crear Tablas**

Ejecuta el script completo de creación de tablas:

```sql
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
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'un',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_categoria_id (categoria_id),
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
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'kg',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_categoria_id (categoria_id),
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
```

### **Paso 3: Stored Procedures**

El sistema incluye stored procedures para operaciones complejas. Estos se crean automáticamente al iniciar la aplicación, pero también se pueden crear manualmente:

#### **1. ValidarPorcentajesBOM**
Valida que los porcentajes de un BOM sumen exactamente 100%.

```sql
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS ValidarPorcentajesBOM(
    IN p_bom_id INT,
    OUT p_valido BOOLEAN,
    OUT p_suma_total DECIMAL(5,2),
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    SELECT COALESCE(SUM(porcentaje), 0) INTO p_suma_total
    FROM bom_items
    WHERE bom_id = p_bom_id;
    
    IF p_suma_total = 100.00 THEN
        SET p_valido = TRUE;
        SET p_mensaje = 'Los porcentajes suman correctamente 100%';
    ELSE
        SET p_valido = FALSE;
        SET p_mensaje = CONCAT('Los porcentajes suman ', p_suma_total, '%. Deben sumar 100%');
    END IF;
END$$
DELIMITER ;
```

#### **2. VerificarStockProduccion**
Verifica si hay suficiente stock de materiales para producir un producto.

```sql
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
    DECLARE v_falta_stock BOOLEAN DEFAULT FALSE;
    DECLARE v_mensaje_detalle TEXT DEFAULT '';
    
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR
        SELECT bi.material_id, (bi.cantidad * p_cantidad_producir) as cantidad_necesaria
        FROM bom_items bi
        INNER JOIN boms b ON bi.bom_id = b.id
        WHERE b.producto_id = p_producto_id AND b.estado = 'aprobado'
        ORDER BY b.id DESC LIMIT 1;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_material_id, v_cantidad_necesaria;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Aquí se asume que existe una columna stock en materiales
        -- Si no existe, este procedimiento necesita ajustarse
        SELECT COALESCE(stock, 0) INTO v_stock_disponible
        FROM materiales
        WHERE id = v_material_id;
        
        IF v_stock_disponible < v_cantidad_necesaria THEN
            SET v_falta_stock = TRUE;
            SET v_mensaje_detalle = CONCAT(v_mensaje_detalle, 
                'Material ID ', v_material_id, ': necesita ', v_cantidad_necesaria, 
                ', disponible ', v_stock_disponible, '; ');
        END IF;
    END LOOP;
    CLOSE cur;
    
    IF v_falta_stock THEN
        SET p_disponible = FALSE;
        SET p_mensaje = CONCAT('Stock insuficiente. ', v_mensaje_detalle);
    ELSE
        SET p_disponible = TRUE;
        SET p_mensaje = 'Stock suficiente para la producción';
    END IF;
END$$
DELIMITER ;
```

#### **3. CalcularTotalesBOM**
Calcula los totales de porcentajes y cantidades de un BOM.

```sql
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
        COUNT(*),
        GROUP_CONCAT(CONCAT(material_id, ':', cantidad, ':', porcentaje) SEPARATOR '; ')
    INTO p_total_porcentaje, p_total_cantidad, p_num_items, p_detalle
    FROM bom_items
    WHERE bom_id = p_bom_id;
END$$
DELIMITER ;
```

### **Paso 4: Insertar Datos de Ejemplo (Opcional)**

```sql
-- Insertar usuarios de ejemplo
INSERT INTO usuarios (email, password, nombre, rol, estado) VALUES
('admin@proscience.com', '$2a$10$EjemploHashPassword', 'Administrador Sistema', 'administrador', 'activo'),
('supervisor.qa@proscience.com', '$2a$10$EjemploHashPassword', 'Supervisor QA', 'supervisor_qa', 'activo'),
('analista1@proscience.com', '$2a$10$EjemploHashPassword', 'Analista Laboratorio 1', 'analista_laboratorio', 'activo');

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion, tipo_producto, estado) VALUES
('Proteínas', 'Categoría de productos proteicos', 'producto_terminado', 'activo'),
('Vitaminas', 'Categoría de productos vitamínicos', 'producto_terminado', 'activo'),
('Materias Primas Proteicas', 'Materias primas para productos proteicos', 'materia_prima', 'activo');

-- Insertar productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, estado) VALUES
('PROT-001', 'Proteína Whey Premium', 'Proteína de suero de leche premium', 1, 'kg', 'activo'),
('VIT-001', 'Multivitamínico Completo', 'Complejo multivitamínico', 2, 'un', 'activo');

-- Insertar materiales de ejemplo
INSERT INTO materiales (codigo, nombre, descripcion, categoria_id, unidad_medida, estado) VALUES
('MP-001', 'Proteína de Suero Concentrada', 'Materia prima proteica', 3, 'kg', 'activo'),
('MP-002', 'Vitamina D3', 'Materia prima vitamínica', 3, 'g', 'activo');
```

### **Paso 5: Verificar la Configuración**

1. **Abrir MySQL Workbench**: Conectarse a tu servidor MySQL.
2. **Ejecutar el Script**: Copia y pega el script SQL anterior en una nueva pestaña de consulta y ejecútalo.
3. **Verificar Tablas y Datos**:
    - **Tablas**: Ve a la pestaña "Schemas" y expande `proscience` para ver todas las tablas creadas.
    - **Datos**: Ejecuta consultas `SELECT` para verificar los datos insertados.

```sql
-- Consultar usuarios
SELECT * FROM usuarios;

-- Consultar categorías
SELECT * FROM categorias;

-- Consultar productos
SELECT * FROM productos;

-- Consultar materiales
SELECT * FROM materiales;

-- Consultar BOMs
SELECT * FROM boms;

-- Consultar ideas
SELECT * FROM ideas;

-- Consultar pruebas
SELECT * FROM pruebas;
```

---

## 9. Configuración y Ejecución de la Base de Datos

**Proceso de Instalación del SGBD**:

1. **Descargar e Instalar MySQL**: 
   - Obtén el instalador desde el [sitio oficial de MySQL](https://dev.mysql.com/downloads/installer/)
   - Para Windows: Descarga MySQL Installer
   - Para Linux: Usa el gestor de paquetes (`sudo apt install mysql-server` en Ubuntu)
   - Para macOS: Usa Homebrew (`brew install mysql`)

2. **Configurar MySQL**: 
   - Sigue las instrucciones del instalador para configurar el puerto (3306 por defecto) y la contraseña del usuario root.
   - Asegúrate de configurar el charset a `utf8mb4`.

3. **Verificar Instalación**:
   ```bash
   mysql --version
   ```

**Ejecución del Script**:

1. **Abrir MySQL Workbench**: Conéctate al servidor MySQL usando las credenciales configuradas.
2. **Crear Base de Datos**: Ejecuta el script proporcionado en el editor SQL de MySQL Workbench o desde la línea de comandos:
   ```bash
   mysql -u root -p < schema.sql
   ```

3. **Configurar Aplicación Backend**:
   - Edita el archivo `application.properties` con las credenciales de la base de datos:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/proscience?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=tu_contraseña
   ```

**Verificación**:

- **Comprobar Tablas**: Verifica que todas las tablas se hayan creado correctamente:
  ```sql
  SHOW TABLES;
  ```

- **Consultar Estructura**: Revisa la estructura de una tabla:
  ```sql
  DESCRIBE usuarios;
  ```

- **Consultar Datos**: Realiza consultas básicas para asegurar que la base de datos esté operativa:
  ```sql
  SELECT COUNT(*) FROM usuarios;
  SELECT COUNT(*) FROM productos;
  SELECT COUNT(*) FROM materiales;
  ```

- **Verificar Stored Procedures**:
  ```sql
  SHOW PROCEDURE STATUS WHERE Db = 'proscience';
  ```

---

## 10. Otras Consideraciones

### **Seguridad**

- **Contraseñas**: Las contraseñas de usuarios deben almacenarse encriptadas usando BCrypt (implementado en la aplicación Spring Boot).
- **Usuario de Aplicación**: En producción, crear un usuario específico para la aplicación con permisos limitados (solo SELECT, INSERT, UPDATE, DELETE en las tablas necesarias).
- **Conexiones SSL**: En producción, habilitar conexiones SSL para mayor seguridad:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/proscience?useSSL=true&requireSSL=true
  ```

### **Backup y Recuperación**

- **Backups Regulares**: Configurar backups automáticos diarios de la base de datos:
  ```bash
  mysqldump -u root -p proscience > backup_proscience_$(date +%Y%m%d).sql
  ```

- **Restauración**: Para restaurar un backup:
  ```bash
  mysql -u root -p proscience < backup_proscience_20250110.sql
  ```

### **Rendimiento**

- **Índices**: Los índices ya están definidos en las tablas para optimizar consultas frecuentes.
- **Connection Pool**: La aplicación Spring Boot utiliza HikariCP como pool de conexiones por defecto.
- **Monitoreo**: Considerar implementar herramientas de monitoreo como MySQL Enterprise Monitor o herramientas open source.

### **Migraciones**

- El proyecto incluye scripts de migración para actualizar la estructura de la base de datos:
  - `migration_ideas_update.sql`: Actualiza la tabla de ideas con nuevos campos
  - `migration_roles.sql`: Actualiza los roles de usuarios

### **Uso de Puertos**

- Asegúrate de que el puerto 3306 esté abierto y accesible para las conexiones.
- En producción, considera usar un firewall para restringir el acceso solo a las IPs necesarias.

### **Archivos de Configuración**

- Ajusta los archivos `my.cnf` (Linux) o `my.ini` (Windows) para adaptarse a las necesidades del proyecto:
  ```ini
  [mysqld]
  character-set-server=utf8mb4
  collation-server=utf8mb4_unicode_ci
  max_connections=200
  innodb_buffer_pool_size=1G
  ```

### **IP del Servidor**

- Verifica que la IP del servidor de base de datos sea accesible desde las redes requeridas.
- En desarrollo local, usar `localhost` o `127.0.0.1`.
- En producción, configurar la IP del servidor y ajustar los permisos de acceso.

### **Timezone**

- Configurar el timezone correcto en MySQL y en la aplicación:
  ```sql
  SET time_zone = '-05:00'; -- Para Colombia (America/Bogota)
  ```

### **Logs y Auditoría**

- Considerar implementar tablas de auditoría para rastrear cambios importantes en los datos.
- Los campos `created_at` y `updated_at` proporcionan información básica de auditoría.

---

**Fin del Documento**

