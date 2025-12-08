# PT-MU-01.Manual de Usuario (Plantilla)

## Manual de Usuario - Proscience Lab PLM/LIMS
Proscience Lab - PLM/LIMS
v1.0

**HISTORIAL DE REVISIÓN**

| Versión | Fecha Elaboración | Responsable Elaboración | Fecha Aprobación | Responsable Aprobación |
| --- | --- | --- | --- | --- |
| 1.0 | 10/01/2025 | Sistema |  |  |
|  |  |  |  |  |

**CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR**

| **VERSIÓN** | **MODIFICACIÓN RESPECTO VERSIÓN ANTERIOR** |
| --- | --- | --- |
| 1.0 | Creación inicial del documento. |
|  |  |
|  |  |

## Tabla de Contenido.

1. [Introducción](#1-introducción)
2. [Alcance](#2-alcance)
3. [Definiciones, Siglas y Abreviaturas](#3-definiciones-siglas-y-abreviaturas)
4. [Responsables e involucrados](#4-responsables-e-involucrados)
5. [Roles y Usuarios](#5-roles-y-usuarios)
   - [5.1 Usuarios](#51-usuarios)
   - [5.2 Roles](#52-roles)
6. [Ingreso al Sistema](#6-ingreso-al-sistema)
7. [Navegación](#7-navegación)
8. [Opciones, Módulos o Funcionalidades](#8-opciones-módulos-o-funcionalidades)
   - [8.1 Dashboard](#81-dashboard)
   - [8.2 Ideas / Nuevas Fórmulas](#82-ideas--nuevas-fórmulas)
   - [8.3 Inventario](#83-inventario)
   - [8.4 IA / Simulación](#84-ia--simulación)
   - [8.5 Producción / Proceso](#85-producción--proceso)
   - [8.6 Pruebas / Control de Calidad](#86-pruebas--control-de-calidad)
   - [8.7 Historial](#87-historial)
   - [8.8 Aprobación / QA](#88-aprobación--qa)
   - [8.9 Trazabilidad Lote](#89-trazabilidad-lote)
   - [8.10 Base de Conocimiento](#810-base-de-conocimiento)
   - [8.11 Configuración](#811-configuración)
9. [Mensajes](#9-mensajes)
   - [9.1 Error](#91-error)
   - [9.2 Advertencia](#92-advertencia)
   - [9.3 Confirmación](#93-confirmación)
   - [9.4 Información](#94-información)

## 1. Introducción

Este manual de usuario proporciona una guía completa para el uso del sistema **Prosience Lab - PLM/LIMS** (Product Lifecycle Management / Laboratory Information Management System). El sistema está diseñado para gestionar el ciclo de vida completo de productos nutracéuticos, desde la generación de ideas hasta la producción, incluyendo la gestión de materiales, BOMs (Bill of Materials), pruebas de laboratorio y trazabilidad completa.

El sistema está orientado a laboratorios y empresas del sector nutracéutico que requieren cumplir con normativas BPM (Buenas Prácticas de Manufactura) y mantener un control riguroso de calidad en todas las etapas del proceso productivo.

Este manual está dirigido a todos los usuarios del sistema, independientemente de su rol, y proporciona instrucciones detalladas para el uso de cada funcionalidad disponible según los permisos asignados.

## 2. Alcance

Este manual cubre todas las funcionalidades del sistema **Prosience Lab - PLM/LIMS** disponibles para los diferentes roles de usuario:

- ✅ **Proceso de autenticación y acceso al sistema**
- ✅ **Navegación e interfaz de usuario**
- ✅ **Gestión de ideas y nuevas fórmulas**
- ✅ **Gestión de inventario (productos, materiales, categorías)**
- ✅ **Gestión de BOMs (Bill of Materials)**
- ✅ **Pruebas de laboratorio y control de calidad**
- ✅ **Trazabilidad de lotes**
- ✅ **Aprobaciones y flujos de trabajo**
- ✅ **Base de conocimiento y documentación**
- ✅ **Configuración del sistema**

El manual está organizado por módulos funcionales y describe las operaciones disponibles según el rol del usuario, asegurando que cada usuario tenga acceso a la información relevante para sus responsabilidades.

## 3. Definiciones, Siglas y Abreviaturas

- **SGBD**: Sistema de Gestión de Bases de Datos.
- **API**: Interfaz de Programación de Aplicaciones.
- **CRUD**: Operaciones básicas de manejo de datos (Crear, Leer, Actualizar, Borrar).
- **UI**: Interfaz de Usuario.
- **UX**: Experiencia del Usuario.
- **PLM**: Product Lifecycle Management (Gestión del Ciclo de Vida del Producto).
- **LIMS**: Laboratory Information Management System (Sistema de Gestión de Información de Laboratorio).
- **BOM**: Bill of Materials (Lista de Materiales).
- **BPM**: Buenas Prácticas de Manufactura.
- **QA**: Quality Assurance (Aseguramiento de Calidad).
- **OOS**: Out of Specification (Fuera de Especificación).
- **JWT**: JSON Web Token (Token de autenticación).
- **IA**: Inteligencia Artificial.
- **SOP**: Standard Operating Procedure (Procedimiento Operativo Estándar).

## 4. Responsables e involucrados

| **Nombre** | **Tipo (Responsable/ Involucrado)** | **Rol** |
| --- | --- | --- |
| Equipo de Desarrollo | Responsable | Desarrollo y Mantenimiento del Sistema |
| Equipo de QA | Involucrado | Validación y Pruebas del Sistema |
| Usuarios Finales | Involucrado | Operadores del Sistema |
| Administradores del Sistema | Responsable | Configuración y Gestión de Usuarios |

## 5. Roles y Usuarios

### 5.1 Usuarios

El sistema **Prosience Lab - PLM/LIMS** está diseñado para ser utilizado por diferentes tipos de usuarios según sus responsabilidades en el proceso productivo y de calidad. Cada usuario tiene un perfil único identificado por su correo electrónico y contraseña, y se le asigna un rol específico que determina sus permisos y acceso a las funcionalidades del sistema.

**Tipos de Usuarios:**
- Usuarios con rol de **Administrador**
- Usuarios con rol de **Supervisor QA**
- Usuarios con rol de **Supervisor Calidad**
- Usuarios con rol de **Analista de Laboratorio**

### 5.2 Roles

El sistema define cuatro roles principales, cada uno con permisos y responsabilidades específicas:

#### **5.2.1 Administrador**

**Descripción**: Usuario avanzado con acceso completo al sistema. Soporte técnico del sistema, puede otorgar roles y gestionar usuarios.

**Permisos y Accesos**:
- ✅ Acceso completo a todas las funcionalidades del sistema
- ✅ Gestión de usuarios y asignación de roles
- ✅ Configuración del sistema
- ✅ Acceso a fórmulas reales en la base de datos
- ✅ Visión total del sistema
- ✅ Gestión de todas las ideas y fórmulas
- ✅ Acceso a todos los módulos sin restricciones

**Módulos Disponibles**:
- Dashboard Administrativo
- Ideas / Nuevas Fórmulas
- Inventario (completo)
- IA / Simulación
- Producción / Proceso
- Pruebas / Control de Calidad
- Historial
- Aprobación / QA
- Trazabilidad Lote
- Base de Conocimiento
- Configuración

#### **5.2.2 Supervisor QA**

**Descripción**: Supervisor de Aseguramiento de Calidad. Acceso completo a fórmulas reales en la base de datos. Visión total del sistema, recibe notificaciones de stock, lotes, trazabilidad, documentos, reportes, alertas. Puede ver el estado de formulación y quién está operando.

**Permisos y Accesos**:
- ✅ Acceso completo a fórmulas reales en la base de datos
- ✅ Visión total del sistema
- ✅ Recibe notificaciones de stock, lotes, trazabilidad, documentos, reportes, alertas
- ✅ Puede ver el estado de formulación y quién está operando
- ✅ Gestión de análisis de formulaciones
- ✅ Acceso a documentos y reportes
- ✅ Aprobación de ideas y BOMs
- ❌ No puede gestionar usuarios ni configurar el sistema

**Módulos Disponibles**:
- Dashboard Supervisor QA
- Ideas / Nuevas Fórmulas
- Inventario (completo)
- IA / Simulación
- Producción / Proceso
- Pruebas / Control de Calidad
- Historial
- Aprobación / QA
- Trazabilidad Lote
- Base de Conocimiento

#### **5.2.3 Supervisor Calidad**

**Descripción**: Supervisor de Calidad. Recibe materias primas, ingresa datos de proveedor, lotes, trazabilidad. Lleva el informe del estado del análisis de materias primas antes de pasar a formulación. Hace devoluciones de materias primas no aptas. **No tiene permisos sobre análisis de formulaciones**.

**Permisos y Accesos**:
- ✅ Recibir materias primas
- ✅ Ingresar datos de proveedor, lotes, trazabilidad
- ✅ Llevar informe del estado del análisis de materias primas
- ✅ Hacer devoluciones de materias primas no aptas
- ✅ Ver trazabilidad completa
- ✅ Gestión de inventario de materias primas
- ❌ No tiene acceso a análisis de formulaciones
- ❌ No tiene acceso a fórmulas reales
- ❌ No puede aprobar ideas o BOMs

**Módulos Disponibles**:
- Dashboard Supervisor Calidad
- Inventario (solo materias primas y categorías)
- Pruebas / Control de Calidad (solo materias primas)
- Historial
- Aprobación / QA (solo materias primas)
- Trazabilidad Lote
- Base de Conocimiento

#### **5.2.4 Analista de Laboratorio**

**Descripción**: Auxiliar de I+D. Recibe órdenes de formulación. No tiene acceso a base de datos con fórmulas reales. Solo cumple requerimientos especificados en órdenes, desarrollo de la misma e ingreso del análisis sensorial.

**Permisos y Accesos**:
- ✅ Recibir órdenes de formulación (ideas asignadas)
- ✅ Realizar pruebas de laboratorio según especificaciones
- ✅ Ingresar análisis sensorial
- ✅ Ver ideas asignadas para pruebas
- ✅ Crear y gestionar pruebas de laboratorio
- ✅ Registrar resultados analíticos
- ❌ No tiene acceso a fórmulas reales
- ❌ No puede ver todas las ideas del sistema
- ❌ No puede aprobar o rechazar ideas
- ❌ No tiene acceso a inventario completo

**Módulos Disponibles**:
- Dashboard Analista de Laboratorio
- Ideas / Nuevas Fórmulas (solo ideas asignadas - aparece como "Asignado")
- Pruebas / Control de Calidad
- Historial

## 6. Ingreso al Sistema

### **6.1 Acceso Inicial**

1. **Abrir el Navegador Web**:
   - Abrir un navegador web compatible (Chrome, Firefox, Edge, Safari - versiones recientes)
   - Acceder a la URL del sistema proporcionada por el administrador
   - **Desarrollo**: `http://localhost:3000`
   - **Producción**: `https://tu-proyecto.vercel.app` (o la URL configurada)

2. **Página de Login**:
   - Al acceder a la URL, se mostrará automáticamente la página de inicio de sesión
   - La página muestra el logo y nombre del sistema: **"Prosience Lab - PLM/LIMS System"**

### **6.2 Proceso de Autenticación**

1. **Ingresar Credenciales**:
   - En el campo **"Email"**, ingresar la dirección de correo electrónico asociada a tu cuenta
   - En el campo **"Contraseña"**, ingresar tu contraseña
   - Hacer clic en el ícono de ojo para mostrar/ocultar la contraseña (opcional)

2. **Iniciar Sesión**:
   - Hacer clic en el botón **"Iniciar Sesión"**
   - El sistema validará las credenciales
   - Si las credenciales son correctas, serás redirigido automáticamente al Dashboard principal
   - Si las credenciales son incorrectas, se mostrará un mensaje de error

3. **Mensajes de Error Comunes**:
   - **"Error al iniciar sesión"**: Las credenciales son incorrectas o el usuario no existe
   - **"Usuario inactivo"**: El usuario ha sido desactivado por un administrador
   - **"Error de conexión"**: Problema de conectividad con el servidor

### **6.3 Recuperación de Contraseña**

- Si olvidaste tu contraseña, hacer clic en el enlace **"¿Olvidaste tu contraseña?"** en la página de login
- Contactar al administrador del sistema para restablecer la contraseña

### **6.4 Primera Vez en el Sistema**

- Al ingresar por primera vez, el sistema mostrará el Dashboard correspondiente a tu rol
- Se recomienda revisar el Dashboard para familiarizarse con las métricas y alertas disponibles
- Explorar el menú lateral (Sidebar) para conocer los módulos disponibles según tu rol

## 7. Navegación

### **7.1 Estructura de la Interfaz**

La interfaz del sistema está compuesta por los siguientes elementos:

1. **Sidebar (Menú Lateral)**:
   - Ubicado en el lado izquierdo de la pantalla
   - Contiene el logo del sistema y el menú de navegación
   - Muestra los módulos disponibles según el rol del usuario
   - Incluye información del usuario actual (nombre, email, rol)
   - Botones de Ayuda y Cerrar Sesión

2. **Área de Contenido Principal**:
   - Ocupa el espacio restante de la pantalla
   - Muestra el contenido del módulo seleccionado
   - Incluye encabezados, filtros, tablas, formularios, etc.

3. **Header/Barra Superior** (en algunos módulos):
   - Muestra el título del módulo actual
   - Botones de acción rápida
   - Filtros y búsquedas

### **7.2 Menú de Navegación (Sidebar)**

El menú lateral muestra los siguientes módulos (según el rol del usuario):

- **Dashboard**: Vista principal con métricas y resumen
- **Ideas / Nuevas Fórmulas**: Gestión de ideas de productos (aparece como "Asignado" para analistas)
- **Inventario**: Gestión de productos, materiales y categorías
- **IA / Simulación**: Herramientas de inteligencia artificial
- **Producción / Proceso**: Gestión de procesos de producción
- **Pruebas / C. Calidad**: Gestión de pruebas de laboratorio
- **Historial**: Historial de operaciones y cambios
- **Aprobación / QA**: Procesos de aprobación y control de calidad
- **Trazabilidad Lote**: Trazabilidad completa de lotes
- **Base de Conocimiento**: Documentación y SOPs
- **Configuración**: Configuración del sistema (solo Administradores)

### **7.3 Navegación entre Módulos**

1. **Seleccionar un Módulo**:
   - Hacer clic en el nombre del módulo en el Sidebar
   - El módulo seleccionado se resaltará con color primario
   - El contenido principal se actualizará para mostrar el módulo seleccionado

2. **Indicador de Módulo Activo**:
   - El módulo actualmente activo se muestra con fondo de color primario y texto destacado
   - Los módulos inactivos se muestran en color gris

3. **Navegación Móvil**:
   - En dispositivos móviles, el Sidebar se oculta automáticamente
   - Hacer clic en el botón de menú (☰) en la esquina superior izquierda para mostrar/ocultar el menú
   - El menú móvil aparece como un panel deslizante desde la izquierda

### **7.4 Información del Usuario**

En la parte inferior del Sidebar se muestra:
- **Nombre del usuario** actual
- **Email** del usuario
- **Rol** del usuario (Administrador, Supervisor QA, Supervisor Calidad, Analista de Laboratorio)

### **7.5 Cerrar Sesión**

1. **Proceso de Cierre de Sesión**:
   - Hacer clic en el botón **"Cerrar Sesión"** en la parte inferior del Sidebar
   - El sistema cerrará la sesión y redirigirá a la página de login
   - Se recomienda cerrar sesión al finalizar el trabajo para mantener la seguridad

## 8. Opciones, Módulos o Funcionalidades

### **8.1 Dashboard**

El Dashboard es la página principal del sistema y muestra una vista consolidada del estado operativo según el rol del usuario.

#### **8.1.1 Dashboard Administrador / Supervisor QA**

**Contenido**:
- **Alertas Críticas**: Lotes pendientes de liberación que requieren atención inmediata
- **KPIs Principales**:
  - Lotes Pendientes
  - No Conformidades Activas (con desglose por criticidad)
  - Órdenes en Producción
  - Pruebas Pendientes
- **Gráficos**:
  - Producción por Línea (últimos 7 días)
  - Estado de Equipos (calibrados, vencen pronto, vencidos)
- **Tablas de Información**:
  - Lotes Pendientes de Liberación
  - No Conformidades Activas

**Acciones Disponibles**:
- Hacer clic en "Revisar Ahora" en alertas críticas para ir al módulo de Aprobación
- Hacer clic en "Ver todos los lotes" para ver el listado completo
- Hacer clic en "Ver todas las NC" para ver todas las no conformidades

#### **8.1.2 Dashboard Supervisor Calidad**

**Contenido**:
- **KPIs Principales**:
  - Materias Primas Recibidas
  - Análisis Pendientes
  - Lotes en Trazabilidad
  - Devoluciones (materias primas no aptas)
- **Gráficos**:
  - Materias Primas por Estado (Aptas, En Análisis, No Aptas)
  - Trazabilidad Activa (Lotes Rastreables, Proveedores Activos)
- **Tablas de Información**:
  - Materias Primas Recientes
  - Lotes en Trazabilidad

**Acciones Disponibles**:
- Acceder a materias primas desde los enlaces en las tablas
- Ver trazabilidad completa desde los enlaces

#### **8.1.3 Dashboard Analista de Laboratorio**

**Contenido**:
- **Alertas**: Ideas pendientes de pruebas
- **KPIs Principales**:
  - Ideas en Prueba
  - Pruebas Aprobadas
  - Total Asignadas
  - Completadas Hoy
- **Tablas de Información**:
  - Ideas Asignadas para Pruebas (con acciones de aprobar/rechazar)
  - Información de Pruebas (guía del proceso)

**Acciones Disponibles**:
- Hacer clic en "Ver Ideas" para ir al módulo de Ideas
- Aprobar o rechazar pruebas directamente desde el Dashboard
- Acceder al módulo de Pruebas para crear nuevas pruebas

### **8.2 Ideas / Nuevas Fórmulas**

Este módulo permite gestionar ideas de nuevos productos y fórmulas. El acceso y funcionalidades varían según el rol del usuario.

#### **8.2.1 Para Administradores y Supervisores QA**

**Funcionalidades**:
- Ver todas las ideas del sistema
- Crear nuevas ideas
- Editar ideas existentes
- Cambiar el estado de las ideas (generada, en_revision, aprobada, en_prueba, prueba_aprobada, rechazada, en_produccion)
- Asignar ideas a analistas de laboratorio
- Ver detalles completos de cada idea, incluyendo:
  - Título y descripción
  - Detalles generados por IA (BOM modificado, escenarios)
  - Pruebas requeridas
  - Producto origen
  - Historial de cambios

**Flujo de Trabajo**:
1. **Crear Idea**: Hacer clic en "Nueva Idea" y completar el formulario
2. **Revisar**: Cambiar estado a "en_revision"
3. **Aprobar**: Cambiar estado a "aprobada"
4. **Asignar a Analista**: Seleccionar analista y cambiar estado a "en_prueba"
5. **Esperar Pruebas**: El analista realiza las pruebas
6. **Aprobar Pruebas**: Cambiar estado a "prueba_aprobada" cuando las pruebas sean exitosas
7. **Enviar a Producción**: Cambiar estado a "en_produccion"

**Filtros Disponibles**:
- Por estado
- Por categoría
- Por prioridad
- Búsqueda por texto

#### **8.2.2 Para Analistas de Laboratorio**

**Funcionalidades**:
- Ver solo las ideas asignadas en estado "EN_PRUEBA"
- Ver detalles de las ideas asignadas
- Ver pruebas asociadas a cada idea
- Aprobar o rechazar pruebas desde el Dashboard o módulo de Ideas

**Limitaciones**:
- No pueden crear nuevas ideas
- No pueden cambiar el estado de las ideas (excepto aprobar/rechazar pruebas)
- No pueden ver todas las ideas del sistema
- No tienen acceso a fórmulas reales

### **8.3 Inventario**

El módulo de Inventario permite gestionar productos terminados, materias primas, categorías y unidades de medida.

#### **8.3.1 Productos Terminados**

**Funcionalidades** (Administradores y Supervisores QA):
- Ver listado de productos terminados
- Crear nuevos productos
- Editar productos existentes
- Activar/desactivar productos
- Ver detalles de cada producto:
  - Código único
  - Nombre y descripción
  - Categoría
  - Unidad de medida
  - Estado (activo/inactivo)
  - Fechas de creación y actualización

**Campos del Formulario**:
- **Código**: Código único del producto (requerido, único)
- **Nombre**: Nombre del producto (requerido)
- **Descripción**: Descripción detallada (opcional)
- **Categoría**: Seleccionar de categorías existentes
- **Unidad de Medida**: Unidad de medida (un, kg, g, etc.)

#### **8.3.2 Materia Prima**

**Funcionalidades** (Administradores, Supervisores QA y Supervisores Calidad):
- Ver listado de materias primas
- Crear nuevas materias primas
- Editar materias primas existentes
- Activar/desactivar materias primas
- Gestionar recepción de materias primas (Supervisor Calidad)
- Registrar datos de proveedor y lotes (Supervisor Calidad)
- Hacer devoluciones de materias primas no aptas (Supervisor Calidad)

**Campos del Formulario**:
- **Código**: Código único del material (requerido, único)
- **Nombre**: Nombre de la materia prima (requerido)
- **Descripción**: Descripción detallada (opcional)
- **Categoría**: Seleccionar de categorías existentes
- **Unidad de Medida**: Unidad de medida (kg, g, mg, etc.)

#### **8.3.3 Categorías**

**Funcionalidades**:
- Ver listado de categorías
- Crear nuevas categorías
- Editar categorías existentes
- Activar/desactivar categorías

**Tipos de Categoría**:
- **Producto Terminado**: Para productos finales
- **Materia Prima**: Para materias primas
- **Componente**: Para componentes intermedios

**Campos del Formulario**:
- **Nombre**: Nombre de la categoría (requerido, único)
- **Descripción**: Descripción detallada (opcional)
- **Tipo de Producto**: Seleccionar tipo (requerido)
- **Estado**: Activo/Inactivo

#### **8.3.4 Unidades de Medida**

**Funcionalidades**:
- Ver listado de unidades de medida disponibles
- Gestionar unidades estándar del sistema

### **8.4 IA / Simulación**

Este módulo proporciona herramientas de inteligencia artificial para análisis y simulación de fórmulas.

**Disponible para**: Administradores y Supervisores QA

**Funcionalidades**:
- Análisis de productos existentes usando IA
- Generación de ideas mejoradas basadas en productos del inventario
- Simulación de modificaciones de BOM
- Generación de escenarios de formulación
- Sugerencias de pruebas requeridas

**Proceso de Uso**:
1. Seleccionar un producto del inventario
2. Especificar el objetivo o modificación deseada
3. El sistema generará sugerencias usando IA
4. Revisar y aprobar las sugerencias
5. Convertir en una nueva idea si es aprobada

### **8.5 Producción / Proceso**

Este módulo gestiona los procesos de producción y órdenes de fabricación.

**Disponible para**: Administradores y Supervisores QA

**Funcionalidades**:
- Ver órdenes de producción
- Crear nuevas órdenes de producción
- Gestionar BOMs (Bill of Materials) para productos
- Ver versiones de BOMs
- Aprobar BOMs para producción
- Verificar disponibilidad de materiales
- Gestionar procesos de producción

**Gestión de BOMs**:
- Cada producto puede tener múltiples versiones de BOM
- Los BOMs tienen estados: borrador, aprobado, obsoleto
- Cada BOM contiene items (materiales) con:
  - Cantidad requerida
  - Unidad de medida
  - Porcentaje en la fórmula
  - Secuencia

**Validaciones**:
- Los porcentajes de los items deben sumar 100%
- Se valida la integridad de los datos
- Se verifica disponibilidad de stock

### **8.6 Pruebas / Control de Calidad**

Este módulo gestiona todas las pruebas de laboratorio y el control de calidad.

#### **8.6.1 Para Analistas de Laboratorio**

**Funcionalidades**:
- Ver pruebas asignadas (solo pruebas activas)
- Crear nuevas pruebas vinculadas a ideas asignadas
- Cambiar estado de pruebas:
  - **Pendiente**: Prueba creada pero no iniciada
  - **En Proceso**: Prueba en ejecución
  - **Completada**: Todas las pruebas requeridas completadas y cumplen especificaciones
  - **OOS**: Resultado fuera de especificación
  - **Rechazada**: Prueba rechazada
- Registrar resultados analíticos:
  - Parámetro analizado
  - Especificación
  - Resultado obtenido
  - Unidad de medida
  - Cumplimiento de especificación
  - Observaciones

**Proceso de Creación de Prueba**:
1. Hacer clic en "Nueva Prueba"
2. Seleccionar la idea asociada (solo ideas asignadas en estado EN_PRUEBA)
3. Ingresar código de muestra
4. Especificar tipo de prueba
5. Agregar descripción
6. Especificar equipos utilizados
7. Listar pruebas requeridas con especificaciones
8. Guardar la prueba

**Proceso de Registro de Resultados**:
1. Seleccionar una prueba en estado "En Proceso"
2. Hacer clic en "Ver Detalle"
3. Hacer clic en "Agregar Resultado"
4. Seleccionar parámetro de la lista de pruebas requeridas (o ingresar manualmente)
5. El sistema auto-completa la especificación si está en la lista
6. Ingresar resultado obtenido
7. El sistema evalúa automáticamente si cumple la especificación
8. Ajustar manualmente si es necesario
9. Agregar observaciones
10. Guardar resultado

**Evaluación Automática**:
- El sistema evalúa automáticamente si el resultado cumple con la especificación
- Soporta diferentes formatos de especificación:
  - Rangos: "6.5 - 7.5"
  - Menor o igual: "≤ 5%" o "<= 5"
  - Mayor o igual: "≥ 80%" o ">= 80"
  - Igual: "= 7" o "7"
- Si todos los resultados cumplen y todas las pruebas requeridas tienen resultados, la prueba cambia automáticamente a "Completada"
- Si algún resultado no cumple, la prueba cambia a "OOS"

#### **8.6.2 Para Supervisores QA y Administradores**

**Funcionalidades**:
- Ver todas las pruebas del sistema
- Ver trazabilidad completa de muestras
- Revisar resultados analíticos
- Gestionar investigaciones OOS
- Ver estado de equipos y calibraciones

#### **8.6.3 Para Supervisores Calidad**

**Funcionalidades**:
- Ver pruebas de materias primas
- Gestionar análisis de materias primas
- Registrar resultados de análisis de materias primas
- Hacer devoluciones de materias primas no aptas

### **8.7 Historial**

Este módulo muestra el historial de operaciones, cambios y registros históricos.

**Funcionalidades** (todos los roles):
- Ver historial de ideas (ideas completadas, aprobadas, rechazadas)
- Ver historial de pruebas (pruebas completadas)
- Ver historial de cambios en BOMs
- Ver historial de aprobaciones
- Filtrar por fecha, usuario, tipo de operación

**Para Analistas**:
- Ver solo historial de sus propias operaciones
- Ver ideas que completaron (estado PRUEBA_APROBADA)

**Para Supervisores y Administradores**:
- Ver historial completo del sistema
- Ver historial de todos los usuarios

### **8.8 Aprobación / QA**

Este módulo gestiona los procesos de aprobación y control de calidad.

**Disponible para**: Administradores, Supervisores QA y Supervisores Calidad

**Funcionalidades**:
- Ver lotes pendientes de liberación
- Aprobar o rechazar lotes
- Gestionar no conformidades
- Revisar y firmar documentos
- Verificar cumplimiento BPM
- Gestionar investigaciones OOS

**Proceso de Aprobación de Lotes**:
1. Ver listado de lotes pendientes
2. Revisar documentación y resultados
3. Verificar cumplimiento de especificaciones
4. Aprobar o rechazar el lote
5. Registrar observaciones si es necesario

**Gestión de No Conformidades**:
- Crear nuevas no conformidades
- Asignar criticidad (Crítica, Mayor, Menor)
- Asignar responsable
- Seguimiento hasta cierre
- Documentar acciones correctivas

### **8.9 Trazabilidad Lote**

Este módulo proporciona trazabilidad completa de lotes desde materias primas hasta productos terminados.

**Disponible para**: Administradores, Supervisores QA y Supervisores Calidad

**Funcionalidades**:
- Rastrear origen de materias primas
- Ver historial completo de un lote
- Ver relaciones entre lotes
- Ver proveedores y fechas de recepción
- Ver procesos de transformación
- Generar reportes de trazabilidad

**Búsqueda**:
- Buscar por código de lote
- Buscar por producto
- Buscar por materia prima origen
- Filtrar por fechas

### **8.10 Base de Conocimiento**

Este módulo contiene documentación esencial del sistema con control de versiones.

**Disponible para**: Administradores, Supervisores QA y Supervisores Calidad

**Funcionalidades**:
- Ver documentos disponibles:
  - SOPs (Procedimientos Operativos Estándar)
  - Guías BPM
  - Farmacopeas
  - Documentación regulatoria
- Filtrar por tipo de documento
- Ver versiones de documentos
- Ver estado de documentos (Vigente, Obsoleto)
- Ver información de aprobación

**Tipos de Documentos**:
- **SOP**: Procedimientos Operativos Estándar
- **Guía**: Guías de procedimiento
- **Farmacopea**: Referencias de farmacopeas (USP, etc.)
- **Regulatorio**: Documentación regulatoria
- **Producción**: Documentos de producción
- **Referencia**: Documentos de referencia

### **8.11 Configuración**

Este módulo permite configurar parámetros del sistema.

**Disponible solo para**: Administradores

**Funcionalidades**:
- Gestión de usuarios:
  - Crear nuevos usuarios
  - Editar usuarios existentes
  - Asignar roles
  - Activar/desactivar usuarios
  - Cambiar contraseñas
- Configuración del sistema:
  - Parámetros generales
  - Configuración de notificaciones
  - Configuración de reportes
- Gestión de roles y permisos

**Gestión de Usuarios**:
1. Ver listado de usuarios
2. Crear nuevo usuario:
   - Ingresar nombre
   - Ingresar email (único)
   - Asignar rol
   - Establecer contraseña inicial
3. Editar usuario:
   - Cambiar nombre
   - Cambiar email
   - Cambiar rol
   - Activar/desactivar
4. Eliminar usuario (solo desactivar, no se eliminan permanentemente)

## 9. Mensajes

El sistema muestra diferentes tipos de mensajes para informar al usuario sobre el resultado de sus acciones o el estado del sistema.

### **9.1 Error**

Los mensajes de error se muestran cuando ocurre un problema que impide completar una operación.

**Características**:
- Color rojo o naranja
- Ícono de error (⚠️ o ❌)
- Mensaje descriptivo del problema

**Ejemplos de Mensajes de Error**:
- "Error al iniciar sesión" - Credenciales incorrectas
- "Error al guardar" - Problema al guardar datos
- "No se pudo conectar al servidor" - Problema de conectividad
- "Campos requeridos incompletos" - Formulario incompleto
- "El código ya existe" - Violación de unicidad
- "No tienes permisos para esta acción" - Acceso denegado

**Acciones**:
- Revisar el mensaje para entender el problema
- Corregir los datos si es necesario
- Reintentar la operación
- Contactar al administrador si el problema persiste

### **9.2 Advertencia**

Los mensajes de advertencia se muestran para alertar al usuario sobre situaciones que requieren atención pero no impiden la operación.

**Características**:
- Color amarillo o naranja
- Ícono de advertencia (⚠️)
- Mensaje informativo

**Ejemplos de Mensajes de Advertencia**:
- "Los porcentajes del BOM no suman 100%" - Validación de BOM
- "Stock bajo de material" - Alerta de inventario
- "Hay pruebas pendientes para esta idea" - Recordatorio
- "Esta acción no se puede deshacer" - Confirmación requerida
- "El lote está próximo a vencer" - Alerta de vencimiento

**Acciones**:
- Revisar la advertencia
- Tomar las acciones correctivas si es necesario
- Continuar con la operación si es apropiado

### **9.3 Confirmación**

Los mensajes de confirmación se muestran antes de realizar acciones importantes o irreversibles.

**Características**:
- Diálogo modal
- Opciones "Confirmar" y "Cancelar"
- Mensaje claro de la acción a realizar

**Ejemplos de Confirmaciones**:
- "¿Estás seguro de eliminar este registro?" - Antes de eliminar
- "¿Estás seguro de rechazar esta prueba? La idea será archivada." - Antes de rechazar
- "¿Deseas aprobar este BOM? Esta acción cambiará el estado a 'Aprobado'." - Antes de aprobar
- "¿Confirmas el cambio de estado?" - Antes de cambiar estado

**Acciones**:
- Leer cuidadosamente el mensaje
- Hacer clic en "Confirmar" para proceder
- Hacer clic en "Cancelar" para abortar la operación

### **9.4 Información**

Los mensajes informativos proporcionan información útil al usuario sobre el estado del sistema o guías de uso.

**Características**:
- Color azul o verde
- Ícono de información (ℹ️ o ✓)
- Mensaje descriptivo

**Ejemplos de Mensajes Informativos**:
- "Operación completada exitosamente" - Confirmación de éxito
- "Los datos se han guardado correctamente" - Guardado exitoso
- "Prueba completada. Todas las especificaciones se cumplen." - Resultado positivo
- "Hay 3 ideas pendientes de revisión" - Información de estado
- "Bienvenido al sistema" - Mensaje de bienvenida

**Acciones**:
- Leer la información proporcionada
- Continuar con el flujo de trabajo normal
- No se requiere acción adicional

---

**Fin del Documento**

