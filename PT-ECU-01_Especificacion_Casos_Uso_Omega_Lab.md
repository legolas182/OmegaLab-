# PT-ECU-01. Especificación Casos de uso del sistema

## Omega Lab - PLM/LIMS
v1.0

## **HISTORIAL DE REVISIÓN**

| Versión | Fecha Elaboración | Responsable Elaboración | Fecha Aprobación | Responsable Aprobación |
| --- | --- | --- | --- | --- |
| 1.0 | 10/01/2025 | Sistema |  |  |
|  |  |  |  |  |

## **CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR**

| **VERSIÓN** | **MODIFICACIÓN RESPECTO VERSIÓN ANTERIOR** |
| --- | --- |
| 1.0 | Creación inicial del documento para el sistema Omega Lab - PLM/LIMS. |

## 1. Introducción

El proyecto **Omega Lab - PLM/LIMS** es una plataforma integral de gestión del ciclo de vida de productos (PLM - Product Lifecycle Management) y sistema de información de laboratorio (LIMS - Laboratory Information Management System), diseñada específicamente para la industria nutracéutica.

La aplicación permite gestionar el ciclo completo de productos, desde la generación de ideas y formulación hasta la producción, pruebas de laboratorio y trazabilidad completa, cumpliendo con normativas BPM (Buenas Prácticas de Manufactura).

El sistema integra funcionalidades de:
- **Gestión de Ideas y Formulación**: Creación y seguimiento de nuevas fórmulas de productos
- **Inventario**: Gestión de productos terminados, materias primas, categorías y unidades de medida
- **Gestión de BOMs (Bill of Materials)**: Creación y control de versiones de listas de materiales con validación de proporciones
- **Pruebas de Laboratorio**: Registro y gestión de pruebas analíticas con evaluación automática de cumplimiento
- **Control de Calidad**: Detección automática de OOS (Out of Specification) y gestión de resultados
- **Trazabilidad**: Rastreo completo de lotes desde materias primas hasta productos terminados
- **Inteligencia Artificial**: Asistencia con IA para sugerir combinaciones de productos y optimizar formulaciones
- **Base de Conocimiento**: Gestión de documentación, SOPs y procedimientos

La plataforma busca integrar en un solo lugar la **gestión de formulaciones, inventario, producción, control de calidad, trazabilidad y conocimiento**, brindando una experiencia intuitiva y confiable que garantice el cumplimiento normativo.

### 1.1 Responsables e Involucrados

| **Nombre** | **Tipo (Responsable/ Involucrado)** | **Rol** | Cargo |
| --- | --- | --- | --- |
| [Nombre] | Responsable | Product Owner | [Cargo] |
| [Nombre] | Responsable | Scrum Master | [Cargo] |
| [Nombre] | Responsable | Desarrollador Backend | [Cargo] |
| [Nombre] | Responsable | Desarrollador Frontend | [Cargo] |
| [Nombre] | Involucrado | Supervisor QA | [Cargo] |
| [Nombre] | Involucrado | Supervisor Calidad | [Cargo] |
| [Nombre] | Involucrado | Analista de Laboratorio | [Cargo] |

## **2. Descripción general de actores**

### 2.1 **Administrador:**
- Usuario con acceso completo al sistema.
- Puede gestionar usuarios (crear, editar, asignar roles, activar/desactivar).
- Tiene acceso a todos los módulos del sistema.
- Supervisa el correcto funcionamiento de la plataforma.
- Gestiona la configuración del sistema.
- Visualiza métricas completas del sistema (KPIs, lotes pendientes, no conformidades, órdenes en producción).
- Puede aprobar y gestionar todos los procesos.

### 2.2 **Supervisor QA:**
- Gestiona el proceso de desarrollo de nuevas fórmulas.
- Puede crear nuevas ideas de productos.
- Tiene acceso a fórmulas reales y visión total del sistema.
- Asigna ideas a analistas de laboratorio para realizar pruebas.
- Aprueba o rechaza ideas y BOMs.
- Gestiona el flujo de estados de ideas (generada → aprobada → en_prueba → completada).
- Visualiza notificaciones y alertas del sistema.
- Accede a trazabilidad completa y documentos.
- Genera reportes y visualiza historial completo.
- Puede usar funcionalidades de IA para generar ideas mejoradas.

### 2.3 **Supervisor Calidad:**
- Gestiona la recepción de materias primas.
- Registra datos de proveedores y lotes.
- Gestiona la trazabilidad de materias primas.
- Realiza análisis de materias primas.
- Gestiona devoluciones y no conformidades.
- Visualiza lotes pendientes de liberación.
- No gestiona análisis de formulaciones (solo materias primas).
- Accede a reportes de calidad y trazabilidad.

### 2.4 **Analista de Laboratorio:**
- Recibe órdenes de formulación asignadas por Supervisor QA.
- Visualiza ideas asignadas en su dashboard (módulo "Asignado").
- Crea pruebas de laboratorio vinculadas a ideas asignadas.
- Registra resultados analíticos de las pruebas.
- El sistema evalúa automáticamente el cumplimiento de especificaciones.
- Ingresa análisis sensorial y datos de laboratorio.
- No tiene acceso a fórmulas reales (solo trabaja con ideas asignadas).
- Visualiza su historial de pruebas y resultados.
- Acceso limitado a módulos: Dashboard, Asignado, Pruebas, Historial.

## 3. Diagrama de Casos de Uso

### 3.1. General

**Nota**: Los diagramas de casos de uso deben ser creados utilizando herramientas de modelado UML (como Draw.io, Lucidchart, o herramientas similares). A continuación se describe la estructura de casos de uso que deben incluirse:

**Actores Principales:**
- Administrador
- Supervisor QA
- Supervisor Calidad
- Analista de Laboratorio

**Casos de Uso Principales por Módulo:**

1. **Autenticación y Autorización**
   - Iniciar Sesión
   - Cerrar Sesión
   - Validar Token JWT
   - Recuperar Contraseña (Ideal)

2. **Dashboard**
   - Visualizar KPIs según Rol
   - Ver Alertas y Notificaciones
   - Navegar a Módulos

3. **Ideas / Nuevas Fórmulas**
   - Crear Nueva Idea
   - Editar Idea
   - Cambiar Estado de Idea
   - Asignar Idea a Analista
   - Aprobar/Rechazar Idea
   - Filtrar Ideas por Estado
   - Generar Idea con IA

4. **Inventario**
   - Crear Producto Terminado
   - Crear Materia Prima
   - Crear Categoría
   - Editar Producto/Material
   - Buscar Productos/Materiales
   - Activar/Desactivar Producto

5. **Producción / Proceso (BOMs)**
   - Crear BOM para Producto
   - Agregar Items a BOM
   - Editar Items de BOM
   - Validar Porcentajes de BOM
   - Aprobar BOM
   - Ver Historial de Versiones de BOM

6. **Pruebas / Control de Calidad**
   - Crear Prueba Vinculada a Idea
   - Agregar Resultado Analítico
   - Evaluar Cumplimiento de Especificación
   - Detectar OOS Automáticamente
   - Cambiar Estado de Prueba
   - Ver Historial de Pruebas

7. **Trazabilidad**
   - Rastrear Origen de Materias Primas
   - Ver Historial Completo de Lote
   - Ver Relaciones entre Lotes
   - Generar Reportes de Trazabilidad

8. **Base de Conocimiento**
   - Ver Documentos Disponibles
   - Filtrar por Tipo de Documento
   - Ver Versiones de Documentos

9. **Configuración** (Solo Administrador)
   - Crear Usuario
   - Editar Usuario
   - Asignar Roles
   - Activar/Desactivar Usuario
   - Configurar Sistema

### 3.2. Específicos

**3.2.1 Gestión de Autenticación y Usuarios:**

**Actores:** Administrador, Supervisor QA, Supervisor Calidad, Analista de Laboratorio

**Casos de Uso:**
- Iniciar Sesión
- Cerrar Sesión
- Validar Token JWT
- Recuperar Contraseña (Ideal)
- Gestionar Usuarios (Solo Administrador)
- Asignar Roles (Solo Administrador)

**3.2.2 Gestión de Ideas y Formulación:**

**Actores:** Supervisor QA, Administrador, Analista de Laboratorio

**Casos de Uso:**
- Crear Nueva Idea
- Editar Idea
- Cambiar Estado de Idea
- Asignar Idea a Analista
- Aprobar/Rechazar Idea
- Filtrar Ideas por Estado
- Generar Idea con IA desde Producto
- Ver Ideas Asignadas (Analista)

**3.2.3 Gestión de Inventario y BOMs:**

**Actores:** Supervisor QA, Supervisor Calidad, Administrador

**Casos de Uso:**
- Crear Producto Terminado
- Crear Materia Prima
- Crear Categoría
- Buscar Productos/Materiales
- Crear BOM para Producto
- Validar Porcentajes de BOM
- Aprobar BOM
- Ver Historial de Versiones de BOM

**3.2.4 Gestión de Pruebas y Control de Calidad:**

**Actores:** Analista de Laboratorio, Supervisor QA, Supervisor Calidad

**Casos de Uso:**
- Crear Prueba Vinculada a Idea
- Agregar Resultado Analítico
- Evaluar Cumplimiento Automático
- Detectar OOS Automáticamente
- Cambiar Estado de Prueba
- Ver Historial de Pruebas
- Gestionar Resultados OOS

**3.2.5 Trazabilidad y Reportes:**

**Actores:** Supervisor QA, Supervisor Calidad, Administrador

**Casos de Uso:**
- Rastrear Origen de Materias Primas
- Ver Historial Completo de Lote
- Ver Relaciones entre Lotes
- Generar Reportes de Trazabilidad
- Búsqueda de Lotes

**3.2.6 Base de Conocimiento y Configuración:**

**Actores:** Todos los roles (según permisos)

**Casos de Uso:**
- Ver Documentos Disponibles
- Filtrar por Tipo de Documento
- Ver Versiones de Documentos
- Configurar Sistema (Solo Administrador)

## **4. Especificación de Casos de Uso**

### **4.1 Caso de Uso: Iniciar Sesión**

**ID:** CU-001  
**Nombre:** Iniciar Sesión  
**Actor Principal:** Todos los usuarios (Administrador, Supervisor QA, Supervisor Calidad, Analista de Laboratorio)  
**Requisito Funcional:** RF02 - Inicio de sesión

**Descripción:**
Permite a los usuarios acceder al sistema mediante credenciales válidas (email y contraseña). El sistema valida las credenciales, genera un token JWT y redirige al usuario a su dashboard según su rol.

**Precondiciones:**
- El usuario existe en la base de datos
- El usuario tiene estado "activo"
- El sistema está en funcionamiento

**Flujo Principal:**
1. El usuario accede a la página de login
2. El usuario ingresa su email y contraseña
3. El sistema valida las credenciales
4. El sistema genera un token JWT
5. El sistema redirige al usuario a su dashboard
6. El sistema muestra el nombre y rol del usuario en el Sidebar

**Flujos Alternativos:**
- **3a. Credenciales inválidas:** El sistema muestra mensaje de error y el usuario permanece en la página de login

**Postcondiciones:**
- El usuario está autenticado en el sistema
- Se genera un token JWT válido
- El token se almacena en localStorage
- El usuario puede acceder a los módulos según su rol

---

### **4.2 Caso de Uso: Crear Nueva Idea**

**ID:** CU-002  
**Nombre:** Crear Nueva Idea  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF13 - Creación de nuevas fórmulas

**Descripción:**
Permite a un Supervisor QA o Administrador crear una nueva idea de producto para iniciar el proceso de desarrollo. La idea se crea con estado inicial "generada" y puede ser editada, aprobada o asignada posteriormente.

**Precondiciones:**
- Usuario autenticado con rol Supervisor QA o Administrador
- Existe al menos una categoría en el sistema
- El usuario tiene permisos para crear ideas

**Flujo Principal:**
1. El usuario navega al módulo "Ideas / Nuevas Fórmulas"
2. El usuario hace clic en "Nueva Idea"
3. El usuario completa el formulario (título, descripción, categoría, prioridad, objetivo)
4. El usuario hace clic en "Guardar"
5. El sistema valida los campos requeridos
6. El sistema crea la idea con estado "generada"
7. El sistema muestra mensaje de éxito
8. La idea aparece en el listado

**Flujos Alternativos:**
- **5a. Campos requeridos faltantes:** El sistema muestra mensajes de error específicos y el formulario permanece abierto

**Postcondiciones:**
- La idea se crea exitosamente en la base de datos
- El estado inicial de la idea es "generada"
- Se registra el usuario creador y la fecha de creación
- La idea aparece en el listado de ideas

---

### **4.3 Caso de Uso: Asignar Idea a Analista**

**ID:** CU-003  
**Nombre:** Asignar Idea a Analista  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF13 - Creación de nuevas fórmulas

**Descripción:**
Permite a un Supervisor QA asignar una idea en estado "aprobada" a un Analista de Laboratorio para que realice las pruebas de laboratorio necesarias. El estado de la idea cambia a "en_prueba" y el analista puede verla en su módulo "Asignado".

**Precondiciones:**
- Usuario Supervisor QA autenticado
- Existe una idea en estado "aprobada"
- Existe al menos un usuario con rol Analista de Laboratorio

**Flujo Principal:**
1. El Supervisor QA navega al módulo "Ideas"
2. El Supervisor QA selecciona una idea en estado "aprobada"
3. El Supervisor QA cambia el estado a "en_prueba"
4. El Supervisor QA selecciona un analista de la lista
5. El Supervisor QA confirma el cambio
6. El sistema actualiza el estado de la idea a "en_prueba"
7. El sistema asigna la idea al analista seleccionado
8. El analista puede ver la idea en su Dashboard y módulo "Asignado"

**Flujos Alternativos:**
- **3a. Idea no está en estado "aprobada":** El sistema muestra mensaje de error indicando que solo se pueden asignar ideas aprobadas

**Postcondiciones:**
- El estado de la idea cambia a "en_prueba"
- La idea queda asignada al analista seleccionado
- Se registra el usuario que realizó la asignación y la fecha
- El analista puede ver la idea en su módulo "Asignado"

---

### **4.4 Caso de Uso: Crear BOM para Producto**

**ID:** CU-004  
**Nombre:** Crear BOM para Producto  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF16 - Gestión de BOM con control de versiones

**Descripción:**
Permite a un Supervisor QA crear un BOM (Bill of Materials) para un producto, especificando los materiales, cantidades y porcentajes requeridos. El sistema valida que los porcentajes sumen exactamente 100% antes de permitir guardar.

**Precondiciones:**
- Usuario Supervisor QA autenticado
- Existe un producto en el inventario
- Existen materiales en el inventario

**Flujo Principal:**
1. El Supervisor QA navega a "Producción / Proceso"
2. El Supervisor QA selecciona un producto
3. El Supervisor QA hace clic en "Crear BOM"
4. El Supervisor QA ingresa la versión del BOM
5. El Supervisor QA agrega items al BOM (material, cantidad, porcentaje)
6. El sistema calcula y muestra la suma de porcentajes
7. El Supervisor QA verifica que los porcentajes sumen 100%
8. El Supervisor QA guarda el BOM
9. El sistema valida que los porcentajes sumen 100%
10. El sistema crea el BOM con estado "borrador"
11. El sistema muestra mensaje de éxito

**Flujos Alternativos:**
- **9a. Porcentajes no suman 100%:** El sistema muestra error "Los porcentajes deben sumar 100%" y el BOM no se guarda

**Postcondiciones:**
- El BOM se crea exitosamente con estado "borrador"
- Los items del BOM se guardan correctamente
- Los porcentajes suman exactamente 100%
- El BOM está disponible en el historial del producto

---

### **4.5 Caso de Uso: Validar Porcentajes de BOM**

**ID:** CU-005  
**Nombre:** Validar Porcentajes de BOM  
**Actor Principal:** Sistema  
**Requisito Funcional:** RF19 - Validación de proporciones

**Descripción:**
El sistema valida automáticamente que los porcentajes de un BOM sumen exactamente 100% antes de permitir guardar, rechazando BOMs con porcentajes que no cumplan esta condición.

**Precondiciones:**
- Usuario está creando o editando un BOM
- El BOM tiene al menos un item con porcentaje

**Flujo Principal:**
1. El usuario agrega items al BOM con porcentajes
2. El sistema calcula la suma de porcentajes en tiempo real
3. El usuario intenta guardar el BOM
4. El sistema valida que la suma sea exactamente 100%
5. Si la suma es 100%, el sistema guarda el BOM
6. Si la suma no es 100%, el sistema muestra error y no guarda

**Flujos Alternativos:**
- **4a. Suma < 100%:** El sistema muestra error "Los porcentajes deben sumar 100%" y no guarda
- **4b. Suma > 100%:** El sistema muestra error "Los porcentajes deben sumar 100%" y no guarda

**Postcondiciones:**
- Si la validación pasa: El BOM se guarda exitosamente
- Si la validación falla: El BOM no se guarda y se muestra mensaje de error

---

### **4.6 Caso de Uso: Crear Prueba de Laboratorio**

**ID:** CU-006  
**Nombre:** Crear Prueba de Laboratorio  
**Actor Principal:** Analista de Laboratorio  
**Requisito Funcional:** RF30 - Registro de pruebas analíticas

**Descripción:**
Permite a un Analista de Laboratorio crear una prueba de laboratorio vinculada a una idea asignada. La prueba se crea con estado "pendiente" y puede ser actualizada con resultados posteriormente.

**Precondiciones:**
- Usuario Analista de Laboratorio autenticado
- Existe una idea asignada al analista en estado "en_prueba"

**Flujo Principal:**
1. El Analista navega a "Pruebas / Control de Calidad"
2. El Analista hace clic en "Nueva Prueba"
3. El Analista selecciona una idea asignada del dropdown
4. El Analista completa el formulario (código muestra, tipo prueba, descripción, equipos utilizados, pruebas requeridas)
5. El Analista guarda la prueba
6. El sistema crea la prueba con estado "pendiente"
7. El sistema vincula la prueba a la idea seleccionada
8. El sistema muestra mensaje de éxito
9. La prueba aparece en el listado del analista

**Flujos Alternativos:**
- **3a. No hay ideas asignadas:** El sistema muestra mensaje indicando que no hay ideas asignadas disponibles

**Postcondiciones:**
- La prueba se crea exitosamente con estado "pendiente"
- La prueba queda vinculada a la idea seleccionada
- Se registra el usuario creador y la fecha de creación
- La prueba aparece en el listado de pruebas del analista

---

### **4.7 Caso de Uso: Agregar Resultado Analítico**

**ID:** CU-007  
**Nombre:** Agregar Resultado Analítico  
**Actor Principal:** Analista de Laboratorio  
**Requisito Funcional:** RF30 - Registro de pruebas analíticas

**Descripción:**
Permite a un Analista agregar resultados analíticos a una prueba en estado "en_proceso". El sistema evalúa automáticamente si el resultado cumple con la especificación definida y marca como "Cumple" o "OOS" según corresponda.

**Precondiciones:**
- Existe una prueba en estado "en_proceso"
- La prueba tiene pruebas requeridas definidas
- El usuario Analista está autenticado

**Flujo Principal:**
1. El Analista selecciona una prueba en estado "en_proceso"
2. El Analista hace clic en "Ver Detalle"
3. El Analista hace clic en "Agregar Resultado"
4. El Analista completa el formulario (parámetro, especificación, resultado, unidad)
5. El Analista guarda el resultado
6. El sistema guarda el resultado
7. El sistema evalúa automáticamente si cumple la especificación
8. El sistema marca el resultado como "Cumple" o "No cumple" (OOS)
9. Si es OOS, el sistema cambia el estado de la prueba a "OOS"
10. El resultado aparece en la lista de resultados de la prueba

**Flujos Alternativos:**
- **7a. Resultado cumple especificación:** El resultado se marca como "Cumple" ✓
- **7b. Resultado no cumple especificación:** El resultado se marca como "No cumple" (OOS) ✗ y el estado de la prueba cambia a "OOS"

**Postcondiciones:**
- El resultado se guarda correctamente
- El resultado se marca como "Cumple" o "OOS" según corresponda
- Si es OOS, el estado de la prueba cambia a "OOS"
- El resultado aparece en la lista de resultados

---

### **4.8 Caso de Uso: Evaluación Automática de Cumplimiento**

**ID:** CU-008  
**Nombre:** Evaluación Automática de Cumplimiento  
**Actor Principal:** Sistema  
**Requisito Funcional:** RF30, RF31 - Registro de pruebas analíticas, Gestión de resultados OOS

**Descripción:**
El sistema evalúa automáticamente si un resultado cumple con la especificación definida, comparando valores numéricos contra rangos, límites superiores (≤) e inferiores (≥), y marcando correctamente como "Cumple" o "OOS".

**Precondiciones:**
- Se ha agregado un resultado analítico a una prueba
- El resultado tiene especificación y valor definidos

**Flujo Principal:**
1. El sistema recibe un resultado con especificación y valor
2. El sistema parsea la especificación (rango, límite superior, límite inferior)
3. El sistema compara el valor con la especificación
4. Si el valor cumple: El sistema marca como "Cumple"
5. Si el valor no cumple: El sistema marca como "OOS"
6. Si es OOS: El sistema cambia el estado de la prueba a "OOS"
7. El sistema muestra alerta visual si es OOS

**Flujos Alternativos:**
- **3a. Especificación es rango (ej: "6.5 - 7.5"):** El sistema verifica que el valor esté dentro del rango
- **3b. Especificación es límite superior (ej: "≤ 5%"):** El sistema verifica que el valor sea menor o igual al límite
- **3c. Especificación es límite inferior (ej: "≥ 80%"):** El sistema verifica que el valor sea mayor o igual al límite

**Postcondiciones:**
- El resultado se marca correctamente como "Cumple" o "OOS"
- Si es OOS, el estado de la prueba cambia a "OOS"
- Se muestra alerta visual si es OOS

---

### **4.9 Caso de Uso: Generar Idea con IA**

**ID:** CU-009  
**Nombre:** Generar Idea con IA  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF14 - Asistencia de IA para sugerir combinaciones de productos del inventario

**Descripción:**
Permite a un Supervisor QA generar una idea mejorada desde un producto existente usando OpenAI API. El sistema genera automáticamente una idea con título, descripción, BOM modificado y pruebas requeridas sugeridas.

**Precondiciones:**
- Usuario Supervisor QA autenticado
- Existe un producto en el inventario
- El producto tiene un BOM aprobado
- OpenAI API está configurada y accesible

**Flujo Principal:**
1. El Supervisor QA navega al módulo "IA / Simulación"
2. El Supervisor QA selecciona un producto del inventario
3. El Supervisor QA ingresa un objetivo (ej: "Crear versión sin azúcar")
4. El Supervisor QA hace clic en "Generar Idea"
5. El sistema muestra indicador de carga
6. El sistema llama a OpenAI API con el producto y objetivo
7. El sistema recibe respuesta de IA con idea generada
8. El sistema crea automáticamente la idea en el sistema
9. El sistema muestra el detalle de la idea generada

**Flujos Alternativos:**
- **7a. Error en API de OpenAI:** El sistema muestra mensaje de error y permite crear una idea básica manualmente
- **7b. Respuesta de IA inválida:** El sistema crea una idea básica con los datos disponibles

**Postcondiciones:**
- La idea se crea automáticamente en el sistema
- La idea contiene información generada por IA
- El estado inicial de la idea es "generada"
- Se registra que fue generada usando IA

---

### **4.10 Caso de Uso: Control de Acceso Basado en Roles**

**ID:** CU-010  
**Nombre:** Control de Acceso Basado en Roles  
**Actor Principal:** Sistema  
**Requisito Funcional:** RF04 - Control de acceso basado en roles

**Descripción:**
El sistema restringe el acceso a módulos y funcionalidades según el rol del usuario autenticado. Los usuarios solo pueden acceder a los módulos permitidos según su rol.

**Precondiciones:**
- Usuario autenticado en el sistema
- El usuario tiene un rol asignado

**Flujo Principal:**
1. El usuario inicia sesión exitosamente
2. El sistema identifica el rol del usuario
3. El sistema filtra los módulos disponibles según el rol
4. El sistema muestra solo los módulos permitidos en el Sidebar
5. Si el usuario intenta acceder a un módulo restringido por URL directa, el sistema muestra mensaje "Acceso Restringido"

**Flujos Alternativos:**
- **5a. Usuario Analista intenta acceder a /configuracion:** El sistema muestra mensaje "Acceso Restringido" y redirige al Dashboard
- **5b. Usuario Supervisor QA accede a módulos permitidos:** El sistema permite el acceso normalmente

**Postcondiciones:**
- El usuario solo ve módulos permitidos según su rol
- Los módulos restringidos no son accesibles
- La seguridad del sistema está garantizada

---

### **4.11 Caso de Uso: Ver Historial de Versiones de BOM**

**ID:** CU-011  
**Nombre:** Ver Historial de Versiones de BOM  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF16, RF18 - Gestión de BOM con control de versiones, Historial de cambios con trazabilidad

**Descripción:**
Permite a un Supervisor QA ver todas las versiones de BOM de un producto para rastrear cambios y mantener un historial completo de las modificaciones.

**Precondiciones:**
- Producto con múltiples versiones de BOM en el sistema
- Usuario autenticado con permisos para ver BOMs

**Flujo Principal:**
1. El Supervisor QA navega a un producto que tenga múltiples versiones de BOM
2. El Supervisor QA hace clic en "Ver Historial de BOM"
3. El sistema muestra una lista de todas las versiones
4. Cada versión muestra: número de versión, estado, fecha de creación, usuario creador
5. El Supervisor QA puede hacer clic en una versión para ver su detalle
6. El sistema muestra el detalle completo de la versión seleccionada
7. El sistema muestra los items del BOM en cada versión

**Flujos Alternativos:**
- **3a. Producto sin versiones de BOM:** El sistema muestra mensaje indicando que no hay historial disponible

**Postcondiciones:**
- Se muestra el historial completo de versiones
- Cada versión muestra toda su información relevante
- El usuario puede navegar entre versiones
- El historial está ordenado correctamente

---

### **4.12 Caso de Uso: Aprobar BOM**

**ID:** CU-012  
**Nombre:** Aprobar BOM  
**Actor Principal:** Supervisor QA, Administrador  
**Requisito Funcional:** RF16, RF17 - Gestión de BOM con control de versiones, Justificación técnica de formulaciones

**Descripción:**
Permite a un Supervisor QA aprobar un BOM en estado "borrador" con porcentajes válidos, cambiando su estado a "aprobado" y registrando la justificación técnica.

**Precondiciones:**
- Usuario Supervisor QA autenticado
- Existe un BOM en estado "borrador" con porcentajes válidos (suman 100%)

**Flujo Principal:**
1. El Supervisor QA navega al BOM
2. El Supervisor QA verifica que el BOM está en estado "borrador"
3. El Supervisor QA verifica que los porcentajes suman 100%
4. El Supervisor QA hace clic en "Aprobar BOM"
5. El Supervisor QA ingresa justificación técnica
6. El Supervisor QA confirma la aprobación
7. El sistema cambia el estado del BOM a "aprobado"
8. El sistema registra el usuario aprobador, fecha y justificación
9. El sistema muestra mensaje de éxito
10. El BOM queda disponible para producción

**Flujos Alternativos:**
- **3a. Porcentajes no suman 100%:** El sistema muestra error y no permite aprobar

**Postcondiciones:**
- El estado del BOM cambia a "aprobado"
- Se registra el usuario aprobador, fecha y justificación
- El BOM queda disponible para producción
- El BOM no puede ser editado directamente (requiere nueva versión)

---

**Nota**: Este documento contiene los casos de uso principales del sistema Omega Lab - PLM/LIMS. Los diagramas de casos de uso deben ser creados utilizando herramientas de modelado UML y deben reflejar la estructura descrita en la sección 3.

**Fin del Documento**

