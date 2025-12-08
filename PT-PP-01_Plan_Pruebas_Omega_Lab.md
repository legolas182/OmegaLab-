# PT-PP-01.Plan de Pruebas (Plantilla)

## Omega Lab - PLM/LIMS
v1.0

**HISTORIAL DE REVISIÓN**

| Versión | Fecha Elaboración | Responsable Elaboración | Fecha Aprobación | Responsable Aprobación |
| --- | --- | --- | --- | --- |
| 1.0 | 10/01/2025 | Sistema |  |  |
|  |  |  |  |  |

**CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR**

| **VERSIÓN** | **MODIFICACIÓN RESPECTO VERSIÓN ANTERIOR** |
| --- | --- |
| 1.0 | Creación inicial del documento. |
|  |  |
|  |  |

## TABLA DE CONTENIDO

1. [Introducción](#1-introducción)
2. [Justificación](#2-justificación)
3. [Objetivo](#3-objetivo)
4. [Alcance](#4-alcance)
5. [Plan de Pruebas](#5-plan-de-pruebas)
   - [5.1 Módulo de Autenticación](#51-módulo-de-autenticación)
   - [5.2 Módulo de Dashboard](#52-módulo-de-dashboard)
   - [5.3 Módulo de Ideas / Nuevas Fórmulas](#53-módulo-de-ideas--nuevas-fórmulas)
   - [5.4 Módulo de Inventario](#54-módulo-de-inventario)
   - [5.5 Módulo de IA / Simulación](#55-módulo-de-ia--simulación)
   - [5.6 Módulo de Producción / Proceso (BOMs)](#56-módulo-de-producción--proceso-boms)
   - [5.7 Módulo de Pruebas / Control de Calidad](#57-módulo-de-pruebas--control-de-calidad)
   - [5.8 Módulo de Historial](#58-módulo-de-historial)
   - [5.9 Módulo de Aprobación / QA](#59-módulo-de-aprobación--qa)
   - [5.10 Módulo de Trazabilidad Lote](#510-módulo-de-trazabilidad-lote)
   - [5.11 Módulo de Base de Conocimiento](#511-módulo-de-base-de-conocimiento)
   - [5.12 Módulo de Configuración](#512-módulo-de-configuración)
6. [Casos de Prueba del Sistema](#6-casos-de-prueba-del-sistema)

## 1. INTRODUCCIÓN

Este documento detalla el plan de pruebas para el sistema **Omega Lab - PLM/LIMS** (Product Lifecycle Management / Laboratory Information Management System). El propósito de este plan es definir los procedimientos y casos de prueba necesarios para asegurar que el sistema cumpla con los requisitos establecidos y funcione según lo esperado.

El sistema Omega Lab está diseñado para gestionar el ciclo de vida completo de productos nutracéuticos, desde la generación de ideas hasta la producción, incluyendo la gestión de materiales, BOMs (Bill of Materials), pruebas de laboratorio y trazabilidad completa, cumpliendo con normativas BPM (Buenas Prácticas de Manufactura).

Este plan incluye pruebas de diferentes módulos del sistema para verificar su funcionalidad, desempeño, seguridad y usabilidad, asegurando que el sistema sea robusto, eficiente y seguro para su uso en producción.

## 2. JUSTIFICACIÓN

El sistema **Omega Lab - PLM/LIMS** está diseñado para gestionar integralmente el ciclo de vida de productos nutracéuticos en un entorno que requiere cumplimiento estricto de normativas BPM. La implementación efectiva de este sistema impactará significativamente en:

- **Eficiencia Operativa**: Automatización de procesos manuales, reducción de errores y mejora en la trazabilidad
- **Cumplimiento Normativo**: Garantía de cumplimiento con BPM y normativas de calidad
- **Control de Calidad**: Gestión centralizada de pruebas de laboratorio y resultados analíticos
- **Trazabilidad Completa**: Rastreo de materias primas hasta productos terminados
- **Gestión de Conocimiento**: Centralización de documentación y procedimientos

Se espera que los usuarios experimenten mejoras en la velocidad de procesamiento de ideas, reducción de errores en formulaciones, mejor control de calidad y cumplimiento normativo, lo que justifica la necesidad de un plan de pruebas exhaustivo para garantizar el éxito del proyecto y la confiabilidad del sistema en producción.

## 3. OBJETIVO

El objetivo del plan de pruebas es verificar que cada módulo del sistema funcione correctamente, cumpla con los requisitos especificados y satisfaga las necesidades de los usuarios. Se realizarán:

- **Pruebas Funcionales**: Verificar que todas las funcionalidades operen según lo especificado
- **Pruebas de Integración**: Validar la comunicación entre módulos y servicios externos
- **Pruebas de Seguridad**: Verificar autenticación, autorización y protección de datos
- **Pruebas de Rendimiento**: Evaluar el comportamiento bajo carga
- **Pruebas de Usabilidad**: Validar la experiencia del usuario
- **Pruebas de Compatibilidad**: Verificar funcionamiento en diferentes navegadores y dispositivos

El objetivo final es asegurar que el sistema sea robusto, eficiente, seguro y fácil de usar antes de su despliegue en producción.

## 4. ALCANCE

El alcance de este plan de pruebas abarca todos los módulos del sistema **Omega Lab - PLM/LIMS**:

**Módulos Incluidos**:
- Autenticación y Autorización
- Dashboard (según roles)
- Ideas / Nuevas Fórmulas
- Inventario (Productos, Materiales, Categorías, Unidades de Medida)
- IA / Simulación
- Producción / Proceso (BOMs)
- Pruebas / Control de Calidad
- Historial
- Aprobación / QA
- Trazabilidad Lote
- Base de Conocimiento
- Configuración

**Funcionalidades Clave a Verificar**:
- Autenticación con JWT
- Gestión de roles y permisos
- CRUD de productos, materiales y categorías
- Gestión de ideas y flujo de estados
- Creación y gestión de BOMs con validaciones
- Pruebas de laboratorio y resultados analíticos
- Integración con OpenAI API
- Trazabilidad completa de lotes
- Aprobaciones y flujos de trabajo

**Entorno de Pruebas**:
- **Frontend**: React 18.2.0 en Vite 7.2.2
- **Backend**: Spring Boot 4.0.0 con Java 21
- **Base de Datos**: MySQL 8.0
- **Navegadores**: Chrome, Firefox, Edge, Safari (versiones recientes)
- **Dispositivos**: Desktop, Tablet, Mobile

**Tipos de Pruebas**:
- Pruebas unitarias (backend)
- Pruebas de integración (API)
- Pruebas end-to-end (E2E)
- Pruebas de regresión
- Pruebas de seguridad
- Pruebas de rendimiento

## 5. PLAN DE PRUEBAS

### **5.1 Módulo de Autenticación**

**Descripción**: Verificar el proceso de autenticación, registro y gestión de sesiones.

**Funcionalidades a Probar**:
- Login con credenciales válidas
- Login con credenciales inválidas
- Registro de nuevos usuarios
- Validación de tokens JWT
- Cierre de sesión
- Recuperación de contraseña
- Protección de rutas según roles

**Endpoints a Probar**:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### **5.2 Módulo de Dashboard**

**Descripción**: Verificar que el Dashboard muestre información correcta según el rol del usuario.

**Funcionalidades a Probar**:
- Visualización de KPIs según rol
- Alertas y notificaciones
- Gráficos y métricas
- Navegación rápida a módulos
- Carga de datos en tiempo real

**Variantes por Rol**:
- Dashboard Administrador
- Dashboard Supervisor QA
- Dashboard Supervisor Calidad
- Dashboard Analista de Laboratorio

### **5.3 Módulo de Ideas / Nuevas Fórmulas**

**Descripción**: Verificar la gestión completa del ciclo de vida de ideas de productos.

**Funcionalidades a Probar**:
- Crear nueva idea
- Listar ideas (con filtros)
- Ver detalle de idea
- Editar idea
- Cambiar estado de idea
- Asignar idea a analista
- Aprobar/rechazar idea
- Generar idea desde producto usando IA
- Flujo completo de estados

**Endpoints a Probar**:
- `POST /api/ideas`
- `GET /api/ideas`
- `GET /api/ideas/{id}`
- `PUT /api/ideas/{id}`
- `POST /api/ideas/{id}/change-estado`
- `POST /api/ideas/{id}/approve`
- `POST /api/ideas/{id}/reject`
- `POST /api/ideas/generate-from-product`
- `GET /api/ideas/mis-ideas`

### **5.4 Módulo de Inventario**

**Descripción**: Verificar la gestión de productos, materiales, categorías y unidades de medida.

#### **5.4.1 Productos Terminados**

**Funcionalidades a Probar**:
- Crear producto
- Listar productos (con filtros y búsqueda)
- Ver detalle de producto
- Editar producto
- Activar/desactivar producto
- Validación de código único
- Validación de campos requeridos

**Endpoints a Probar**:
- `POST /api/products`
- `GET /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`

#### **5.4.2 Materias Primas**

**Funcionalidades a Probar**:
- Crear material
- Listar materiales (con filtros)
- Ver detalle de material
- Editar material
- Activar/desactivar material
- Validación de código único

**Endpoints a Probar**:
- `POST /api/materials`
- `GET /api/materials`
- `GET /api/materials/{id}`
- `PUT /api/materials/{id}`

#### **5.4.3 Categorías**

**Funcionalidades a Probar**:
- Crear categoría
- Listar categorías
- Editar categoría
- Validación de nombre único
- Validación de tipo de producto

**Endpoints a Probar**:
- `POST /api/categories`
- `GET /api/categories`
- `GET /api/categories/{id}`
- `PUT /api/categories/{id}`

### **5.5 Módulo de IA / Simulación**

**Descripción**: Verificar la integración con OpenAI API y generación de ideas mejoradas.

**Funcionalidades a Probar**:
- Generar idea desde producto usando IA
- Análisis de BOM existente
- Generación de sugerencias de modificación
- Generación de pruebas requeridas
- Manejo de errores de API
- Validación de respuestas de IA

**Endpoints a Probar**:
- `POST /api/ideas/generate-from-product`

### **5.6 Módulo de Producción / Proceso (BOMs)**

**Descripción**: Verificar la gestión de BOMs (Bill of Materials) y sus items.

**Funcionalidades a Probar**:
- Crear BOM para un producto
- Agregar items a BOM
- Editar items de BOM
- Eliminar items de BOM
- Validar porcentajes (deben sumar 100%)
- Validar integridad de BOM
- Aprobar BOM
- Ver historial de versiones de BOM
- Calcular totales de BOM

**Endpoints a Probar**:
- `POST /api/products/{id}/bom`
- `GET /api/products/{id}/bom/history`
- `POST /api/products/boms/{bomId}/items`
- `GET /api/products/boms/{bomId}`
- `PUT /api/products/bom-items/{itemId}`
- `DELETE /api/products/bom-items/{itemId}`

### **5.7 Módulo de Pruebas / Control de Calidad**

**Descripción**: Verificar la gestión de pruebas de laboratorio y resultados analíticos.

**Funcionalidades a Probar**:
- Crear prueba vinculada a idea
- Listar pruebas (propias o todas según rol)
- Ver detalle de prueba
- Cambiar estado de prueba
- Agregar resultados analíticos
- Evaluación automática de cumplimiento de especificaciones
- Detección automática de OOS (Out of Specification)
- Actualización automática de estado de idea según resultados

**Endpoints a Probar**:
- `POST /api/pruebas`
- `GET /api/pruebas/{id}`
- `GET /api/pruebas/idea/{ideaId}`
- `GET /api/pruebas/mis-pruebas`
- `PUT /api/pruebas/{id}`
- `POST /api/pruebas/{id}/resultados`
- `DELETE /api/pruebas/{id}`

### **5.8 Módulo de Historial**

**Descripción**: Verificar el registro y visualización del historial de operaciones.

**Funcionalidades a Probar**:
- Ver historial de ideas
- Ver historial de pruebas
- Ver historial de cambios en BOMs
- Filtrar historial por fecha, usuario, tipo
- Exportar historial

### **5.9 Módulo de Aprobación / QA**

**Descripción**: Verificar los procesos de aprobación y control de calidad.

**Funcionalidades a Probar**:
- Ver lotes pendientes de liberación
- Aprobar lote
- Rechazar lote
- Gestionar no conformidades
- Verificar cumplimiento BPM

### **5.10 Módulo de Trazabilidad Lote**

**Descripción**: Verificar la trazabilidad completa de lotes.

**Funcionalidades a Probar**:
- Rastrear origen de materias primas
- Ver historial completo de lote
- Ver relaciones entre lotes
- Generar reportes de trazabilidad
- Búsqueda de lotes

### **5.11 Módulo de Base de Conocimiento**

**Descripción**: Verificar la gestión de documentación y SOPs.

**Funcionalidades a Probar**:
- Ver documentos disponibles
- Filtrar por tipo de documento
- Ver versiones de documentos
- Ver estado de documentos

### **5.12 Módulo de Configuración**

**Descripción**: Verificar la configuración del sistema y gestión de usuarios (solo Administradores).

**Funcionalidades a Probar**:
- Crear usuario
- Editar usuario
- Asignar roles
- Activar/desactivar usuario
- Cambiar contraseña
- Configuración del sistema

## 6. CASOS DE PRUEBA DEL SISTEMA

A continuación, se detallan los casos de prueba específicos para cada módulo del sistema, organizados por funcionalidad. Cada caso incluye la información necesaria para la fase 1 (planeación) y espacio para la fase 2 (ejecución).

**Formato de Documentación:**

Los casos de prueba están documentados siguiendo un formato estructurado que incluye:

- **Información General**: Datos del proyecto, módulo, versión, fechas y responsables
- **Información Funcionalidad**: Nombre y descripción de la funcionalidad a probar
- **Información Caso de Prueba**: Identificación del caso, historia de usuario asociada, módulo y responsables
- **Planeación Caso de Prueba**: Precondiciones, datos de entrada, respuesta esperada, pasos detallados y postcondiciones
- **Ejecución Caso de Prueba**: Sección para documentar cada ejecución con versión, fecha, respuesta del sistema, defectos encontrados y veredicto

Este formato permite un seguimiento completo del ciclo de vida de cada caso de prueba, desde la planeación hasta la ejecución y resolución de defectos.

### **6.1 Casos de Prueba - Módulo de Autenticación**

#### **CP-AUTH-001: Login Exitoso con Credenciales Válidas**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Autenticación |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Iniciar Sesión |
| --- | --- |
| Descripción: | Como usuario del sistema, quiero iniciar sesión con mi email y contraseña para acceder a mi dashboard y utilizar las funcionalidades del sistema según mi rol. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-AUTH-001 - Login Exitoso con Credenciales Válidas | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU01 – Iniciar Sesión | **MÓDULO.** | Autenticación |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un usuario puede iniciar sesión correctamente con credenciales válidas y acceder al sistema. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. El usuario existe en la base de datos.
2. El usuario tiene estado "activo".
3. La contraseña es correcta y está encriptada en la base de datos.
4. El sistema está en funcionamiento y accesible.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Email | admin@omegalab.com | Válido |
| Contraseña | password123 | Válido |

| Respuesta Esperada de la aplicación | El sistema valida las credenciales, genera un token JWT, redirige al usuario al Dashboard y muestra el nombre y rol del usuario en el Sidebar. El token se almacena en localStorage. |
| --- | --- |

### Pasos de la Prueba:

1. Abrir la aplicación en el navegador.
2. Ingresar email válido en el campo "Email": `admin@omegalab.com`.
3. Ingresar contraseña válida en el campo "Contraseña": `password123`.
4. Hacer clic en el botón "Iniciar Sesión".

### Postcondiciones:

1. El usuario está autenticado en el sistema.
2. Se genera un token JWT válido.
3. El token se almacena en localStorage.
4. El usuario es redirigido al Dashboard.
5. Se muestra el nombre y rol del usuario en el Sidebar.
6. El usuario puede acceder a los módulos según su rol.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-AUTH-002: Login Fallido con Credenciales Inválidas**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Autenticación |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Iniciar Sesión |
| --- | --- |
| Descripción: | Como usuario del sistema, quiero que el sistema me informe cuando mis credenciales son incorrectas para poder corregirlas. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-AUTH-002 - Login Fallido con Credenciales Inválidas | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU01 – Iniciar Sesión | **MÓDULO.** | Autenticación |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema rechaza credenciales incorrectas y muestra un mensaje de error apropiado sin revelar información sensible. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. El usuario existe en la base de datos.
2. El sistema está en funcionamiento y accesible.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Email | admin@omegalab.com | Válido |
| Contraseña | password_incorrecta | Inválido |

| Respuesta Esperada de la aplicación | El sistema muestra mensaje de error: "Error al iniciar sesión". No se genera token. El usuario permanece en la página de login. No se redirige al Dashboard. |
| --- | --- |

### Pasos de la Prueba:

1. Abrir la aplicación en el navegador.
2. Ingresar email válido en el campo "Email": `admin@omegalab.com`.
3. Ingresar contraseña incorrecta en el campo "Contraseña": `password_incorrecta`.
4. Hacer clic en el botón "Iniciar Sesión".

### Postcondiciones:

1. El usuario NO está autenticado en el sistema.
2. No se genera token JWT.
3. El usuario permanece en la página de login.
4. Se muestra mensaje de error apropiado.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-AUTH-003: Validación de Token JWT en Peticiones**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Autenticación |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Validación de Token JWT |
| --- | --- |
| Descripción: | Como sistema, quiero validar el token JWT en cada petición para asegurar que el usuario está autenticado y autorizado antes de permitir el acceso a recursos protegidos. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-AUTH-003 - Validación de Token JWT en Peticiones | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU01 – Iniciar Sesión / Seguridad | **MÓDULO.** | Autenticación |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que las peticiones a endpoints protegidos requieren un token JWT válido, rechazando peticiones sin token, con token inválido o con token expirado, y permitiendo acceso solo con token válido. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. El sistema está en funcionamiento y accesible.
2. Existe un endpoint protegido (ej: `GET /api/products`).
3. El usuario puede realizar login para obtener un token válido.
4. El sistema tiene configurado el tiempo de expiración del token.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Endpoint | GET /api/products | Válido |
| Token | Sin token / Token inválido / Token expirado / Token válido | Varios escenarios |
| Header Authorization | Bearer <token> o ausente | Varios escenarios |

| Respuesta Esperada de la aplicación | Sin token: Error 401 Unauthorized con mensaje apropiado.<br>Token inválido: Error 401 Unauthorized con mensaje apropiado.<br>Token expirado: Error 401 Unauthorized con mensaje indicando expiración.<br>Token válido: Acceso permitido, respuesta 200 OK con datos. |
| --- | --- |

### Pasos de la Prueba:

**Caso 1: Petición sin token**
1. Realizar login exitoso para obtener un token válido (guardar para referencia).
2. Realizar una petición GET a `/api/products` sin incluir el header Authorization.
3. Verificar la respuesta del servidor.

**Caso 2: Petición con token inválido**
1. Realizar una petición GET a `/api/products` con header Authorization: `Bearer token_invalido`.
2. Verificar la respuesta del servidor.

**Caso 3: Petición con token expirado**
1. Realizar login exitoso para obtener un token.
2. Esperar a que el token expire (o modificar el tiempo de expiración en configuración de prueba).
3. Realizar una petición GET a `/api/products` con el token expirado.
4. Verificar la respuesta del servidor.

**Caso 4: Petición con token válido**
1. Realizar login exitoso para obtener un token válido.
2. Realizar una petición GET a `/api/products` con header Authorization: `Bearer <token_válido>`.
3. Verificar la respuesta del servidor.

### Postcondiciones:

**Caso 1, 2 y 3:**
1. El servidor responde con código de estado HTTP 401 (Unauthorized).
2. Se muestra mensaje de error apropiado.
3. No se devuelven datos del recurso solicitado.
4. El acceso al recurso está bloqueado.

**Caso 4:**
1. El servidor responde con código de estado HTTP 200 (OK).
2. Se devuelven los datos del recurso solicitado.
3. El acceso al recurso está permitido.
4. La petición se procesa correctamente.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.2 Casos de Prueba - Módulo de Dashboard**

#### **CP-DASH-001: Visualización de Dashboard según Rol - Administrador**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Dashboard |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Visualización de Dashboard |
| --- | --- |
| Descripción: | Como Administrador, quiero ver un dashboard con métricas completas del sistema para tener una visión general del estado operativo y tomar decisiones informadas. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-DASH-001 - Visualización de Dashboard según Rol - Administrador | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU05 – Visualizar Dashboard | **MÓDULO.** | Dashboard |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el Dashboard muestra la información correcta y completa para un usuario con rol Administrador, incluyendo KPIs, gráficos y tablas relevantes. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario con rol Administrador existe en la base de datos.
2. Usuario con rol Administrador está autenticado.
3. Existen datos en el sistema (lotes, no conformidades, órdenes de producción, pruebas, etc.).
4. El sistema está en funcionamiento.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Usuario | Administrador | Válido |
| Rol | ADMINISTRADOR | Válido |
| Credenciales | Email y contraseña válidas | Válido |

| Respuesta Esperada de la aplicación | Se muestra "Dashboard Administrativo" como título. Se muestran KPIs: Lotes Pendientes, No Conformidades Activas, Órdenes en Producción, Pruebas Pendientes. Se muestran gráficos de producción. Se muestran tablas de lotes pendientes y no conformidades. Todos los módulos están disponibles en el Sidebar. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión en el sistema con credenciales de Administrador.
2. Acceder al Dashboard (página principal o ruta "/").
3. Verificar que se muestra el título "Dashboard Administrativo".
4. Verificar que se muestran los KPIs: Lotes Pendientes, No Conformidades Activas, Órdenes en Producción, Pruebas Pendientes.
5. Verificar que se muestran gráficos de producción.
6. Verificar que se muestran tablas de lotes pendientes y no conformidades.
7. Verificar que todos los módulos están disponibles en el Sidebar.

### Postcondiciones:

1. El Dashboard se carga correctamente.
2. Todos los elementos visuales se muestran según el diseño.
3. Los datos mostrados son correctos y actualizados.
4. El usuario puede navegar a todos los módulos desde el Sidebar.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-DASH-002: Visualización de Dashboard según Rol - Analista de Laboratorio**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Dashboard |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Visualización de Dashboard |
| --- | --- |
| Descripción: | Como Analista de Laboratorio, quiero ver un dashboard con mis ideas asignadas y pruebas pendientes para gestionar eficientemente mi trabajo de laboratorio. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-DASH-002 - Visualización de Dashboard según Rol - Analista de Laboratorio | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU05 – Visualizar Dashboard | **MÓDULO.** | Dashboard |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el Dashboard muestra solo la información relevante para un Analista de Laboratorio, incluyendo KPIs específicos, ideas asignadas y solo los módulos permitidos según su rol. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario con rol Analista de Laboratorio existe en la base de datos.
2. Usuario con rol Analista está autenticado.
3. Existen ideas asignadas al analista en estado "en_prueba".
4. El sistema está en funcionamiento.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Usuario | Analista | Válido |
| Rol | ANALISTA_LABORATORIO | Válido |
| Credenciales | Email y contraseña válidas | Válido |

| Respuesta Esperada de la aplicación | Se muestra "Dashboard Analista de Laboratorio" como título. Se muestran KPIs: Ideas en Prueba, Pruebas Aprobadas, Total Asignadas, Completadas Hoy. Se muestra tabla de ideas asignadas para pruebas. Solo se muestran módulos permitidos en el Sidebar (Dashboard, Asignado, Pruebas, Historial). |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión en el sistema con credenciales de Analista de Laboratorio.
2. Acceder al Dashboard (página principal o ruta "/").
3. Verificar que se muestra el título "Dashboard Analista de Laboratorio".
4. Verificar que se muestran los KPIs: Ideas en Prueba, Pruebas Aprobadas, Total Asignadas, Completadas Hoy.
5. Verificar que se muestra tabla de ideas asignadas para pruebas.
6. Verificar que solo se muestran módulos permitidos en el Sidebar (Dashboard, Asignado, Pruebas, Historial).
7. Verificar que NO se muestran módulos restringidos (Configuración, Inventario completo, etc.).

### Postcondiciones:

1. El Dashboard se carga correctamente.
2. Solo se muestra información relevante para el Analista.
3. Los datos mostrados son correctos y corresponden solo a las ideas asignadas al analista.
4. El usuario solo puede navegar a los módulos permitidos según su rol.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.3 Casos de Prueba - Módulo de Ideas / Nuevas Fórmulas**

#### **CP-IDEA-001: Crear Nueva Idea**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Ideas / Nuevas Fórmulas |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Nueva Idea |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero crear una nueva idea de producto para iniciar el proceso de desarrollo y gestión del ciclo de vida del producto. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-IDEA-001 - Crear Nueva Idea | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU02 – Crear Nueva Idea | **MÓDULO.** | Ideas / Nuevas Fórmulas |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Supervisor QA o Administrador puede crear una nueva idea con todos los campos requeridos y que la idea se registra correctamente en el sistema con estado inicial "generada". |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario con rol Supervisor QA o Administrador autenticado.
2. Existe al menos una categoría en el sistema.
3. El usuario tiene permisos para crear ideas.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Título | Proteína para Diabéticos | Válido |
| Descripción | Desarrollar una proteína específica para personas con diabetes | Válido |
| Categoría | [ID de categoría existente] | Válido |
| Prioridad | Alta | Válido |
| Objetivo | Crear una proteína con bajo índice glucémico | Válido |

| Respuesta Esperada de la aplicación | La idea se crea exitosamente. El estado inicial es "generada". Se muestra mensaje de éxito. La idea aparece en el listado. Se registra el usuario creador y la fecha de creación. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar al módulo "Ideas / Nuevas Fórmulas".
2. Hacer clic en el botón "Nueva Idea".
3. Completar el formulario:
   - Título: "Proteína para Diabéticos"
   - Descripción: "Desarrollar una proteína específica para personas con diabetes"
   - Categoría: Seleccionar categoría existente del dropdown
   - Prioridad: Seleccionar "Alta"
   - Objetivo: "Crear una proteína con bajo índice glucémico"
4. Hacer clic en el botón "Guardar".

### Postcondiciones:

1. La idea se crea exitosamente en la base de datos.
2. El estado inicial de la idea es "generada".
3. Se registra el usuario creador.
4. Se registra la fecha de creación.
5. La idea aparece en el listado de ideas.
6. Se muestra mensaje de éxito al usuario.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-IDEA-002: Validar Campos Requeridos al Crear Idea**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Ideas / Nuevas Fórmulas |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Nueva Idea |
| --- | --- |
| Descripción: | Como sistema, quiero validar que los campos requeridos estén completos antes de crear una idea para garantizar la integridad de los datos. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-IDEA-002 - Validar Campos Requeridos al Crear Idea | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU02 – Crear Nueva Idea | **MÓDULO.** | Ideas / Nuevas Fórmulas |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema valida campos requeridos antes de crear una idea, mostrando mensajes de error apropiados cuando faltan campos obligatorios y permitiendo crear la idea solo cuando todos los campos requeridos están completos. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario autenticado con permisos para crear ideas (Supervisor QA o Administrador).
2. Existe al menos una categoría en el sistema.
3. El usuario está en la pantalla de creación de nueva idea.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Caso 1 - Título | (vacío) | Inválido |
| Caso 1 - Descripción | Desarrollar una proteína específica | Válido |
| Caso 2 - Título | Proteína para Diabéticos | Válido |
| Caso 2 - Descripción | (vacío) | Inválido |
| Caso 3 - Título | Proteína para Diabéticos | Válido |
| Caso 3 - Descripción | Desarrollar una proteína específica | Válido |
| Caso 3 - Categoría | [ID de categoría existente] | Válido |

| Respuesta Esperada de la aplicación | Caso 1 (sin título): Mensaje de error "El título de la idea es requerido". La idea NO se crea.<br>Caso 2 (sin descripción): Mensaje de error "La descripción es requerida". La idea NO se crea.<br>Caso 3 (todos los campos): La idea se crea exitosamente. |
| --- | --- |

### Pasos de la Prueba:

**Caso 1: Intentar guardar sin título**
1. Navegar al módulo "Ideas / Nuevas Fórmulas".
2. Hacer clic en "Nueva Idea".
3. Completar solo la descripción (dejar título vacío).
4. Intentar guardar.
5. Verificar mensaje de error.

**Caso 2: Intentar guardar sin descripción**
1. Navegar a "Nueva Idea".
2. Completar solo el título (dejar descripción vacía).
3. Intentar guardar.
4. Verificar mensaje de error.

**Caso 3: Guardar con todos los campos requeridos**
1. Navegar a "Nueva Idea".
2. Completar todos los campos requeridos (título, descripción, categoría, prioridad).
3. Guardar.
4. Verificar que la idea se crea exitosamente.

### Postcondiciones:

**Caso 1 y 2:**
1. La idea NO se crea en la base de datos.
2. Se muestra mensaje de error apropiado.
3. El formulario permanece abierto con los datos ingresados.
4. El usuario puede corregir y volver a intentar.

**Caso 3:**
1. La idea se crea exitosamente en la base de datos.
2. Se muestra mensaje de éxito.
3. La idea aparece en el listado.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-IDEA-003: Asignar Idea a Analista de Laboratorio**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Ideas / Nuevas Fórmulas |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Asignar Idea a Analista |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero asignar una idea aprobada a un analista para que realice las pruebas de laboratorio necesarias. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-IDEA-003 - Asignar Idea a Analista de Laboratorio | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU06 – Asignar Idea a Analista | **MÓDULO.** | Ideas / Nuevas Fórmulas |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Supervisor QA puede asignar una idea en estado "aprobada" a un Analista de Laboratorio, cambiando el estado a "en_prueba" y asegurando que el analista pueda ver la idea asignada. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Supervisor QA autenticado.
2. Existe una idea en estado "aprobada" en el sistema.
3. Existe al menos un usuario con rol Analista de Laboratorio en el sistema.
4. El Supervisor QA tiene permisos para cambiar estados de ideas.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Idea ID | 1 | Válido |
| Estado Anterior | aprobada | Válido |
| Estado Nuevo | en_prueba | Válido |
| Analista ID | 5 | Válido |

| Respuesta Esperada de la aplicación | El estado de la idea cambia a "en_prueba". La idea queda asignada al analista seleccionado. El analista puede ver la idea en su Dashboard. El analista puede ver la idea en el módulo "Asignado". Se registra la fecha y usuario que realizó la asignación. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Supervisor QA.
2. Navegar al módulo "Ideas / Nuevas Fórmulas".
3. Seleccionar una idea en estado "aprobada" del listado.
4. Hacer clic en el botón o acción para cambiar estado.
5. Seleccionar el estado "en_prueba" del dropdown.
6. Seleccionar un analista de la lista de analistas disponibles.
7. Confirmar el cambio de estado y asignación.
8. Verificar que la idea cambió de estado.
9. Iniciar sesión como el Analista asignado.
10. Verificar que la idea aparece en su Dashboard.
11. Verificar que la idea aparece en el módulo "Asignado".

### Postcondiciones:

1. El estado de la idea cambia a "en_prueba" en la base de datos.
2. La idea queda asignada al analista seleccionado.
3. Se registra el usuario que realizó la asignación.
4. Se registra la fecha de asignación.
5. El analista puede ver la idea en su Dashboard.
6. El analista puede ver la idea en el módulo "Asignado".

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-IDEA-004: Generar Idea desde Producto usando IA**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | IA / Simulación |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Generar Idea desde Producto usando IA |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero generar una idea mejorada desde un producto existente usando IA para acelerar el proceso de innovación y obtener sugerencias inteligentes. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-IDEA-004 - Generar Idea desde Producto usando IA | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU07 – Generar Idea con IA | **MÓDULO.** | IA / Simulación |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema puede generar una idea mejorada usando OpenAI API, creando automáticamente una idea con título, descripción, BOM modificado y pruebas requeridas sugeridas basadas en un producto existente y un objetivo específico. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Supervisor QA autenticado.
2. Existe un producto en el inventario.
3. El producto tiene un BOM aprobado.
4. OpenAI API está configurada y accesible (API Key válida).
5. El sistema tiene conexión a internet para acceder a OpenAI API.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Producto ID | 1 | Válido |
| Objetivo | Crear versión sin azúcar | Válido |
| OpenAI API Key | Configurada en variables de entorno | Válido |

| Respuesta Esperada de la aplicación | El sistema llama a OpenAI API exitosamente. Se genera una idea con: título generado por IA, descripción detallada, BOM modificado en detallesIA, pruebas requeridas sugeridas. La idea se crea automáticamente en el sistema. Se muestra el detalle de la idea generada. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Supervisor QA.
2. Navegar al módulo "IA / Simulación".
3. Seleccionar un producto del inventario (Producto ID: 1).
4. Ingresar objetivo en el campo correspondiente: "Crear versión sin azúcar".
5. Hacer clic en el botón "Generar Idea".
6. Esperar la respuesta de OpenAI API (puede tomar varios segundos).
7. Verificar que se muestra un indicador de carga mientras se procesa.
8. Verificar que se genera la idea automáticamente.
9. Verificar que se muestra el detalle de la idea generada.
10. Verificar que la idea contiene título, descripción, detallesIA y pruebas requeridas.

### Postcondiciones:

1. La idea se crea automáticamente en la base de datos.
2. La idea contiene información generada por IA.
3. La idea aparece en el listado de ideas.
4. El estado inicial de la idea es "generada".
5. Se registra que fue generada usando IA.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-IDEA-005: Filtrar Ideas por Estado**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Ideas / Nuevas Fórmulas |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Filtrar Ideas |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero filtrar ideas por estado para ver solo las que están en un estado específico y gestionar mejor el flujo de trabajo. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-IDEA-005 - Filtrar Ideas por Estado | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU08 – Filtrar Ideas | **MÓDULO.** | Ideas / Nuevas Fórmulas |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema permite filtrar ideas por estado, mostrando solo las ideas que coinciden con el estado seleccionado y actualizando correctamente el contador de resultados. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario autenticado con permisos para ver ideas.
2. Existen ideas con diferentes estados en el sistema (generada, aprobada, en_prueba, completada, etc.).
3. El usuario está en el módulo "Ideas / Nuevas Fórmulas".

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Filtro Estado | en_prueba | Válido |
| Ideas en sistema | Múltiples con diferentes estados | Válido |

| Respuesta Esperada de la aplicación | Solo se muestran ideas con estado "en_prueba". El contador muestra el número correcto de ideas filtradas. Las ideas de otros estados no se muestran. El filtro se aplica correctamente. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar al módulo "Ideas / Nuevas Fórmulas".
2. Verificar el listado completo de ideas (sin filtro).
3. Contar cuántas ideas hay en total y cuántas tienen estado "en_prueba".
4. Seleccionar el filtro "Estado" del dropdown o selector de filtros.
5. Seleccionar el estado "en_prueba" del dropdown.
6. Verificar que el listado se actualiza automáticamente.
7. Verificar que solo se muestran ideas con estado "en_prueba".
8. Verificar que el contador muestra el número correcto.
9. Verificar que las ideas de otros estados no se muestran.
10. Probar con otro estado para verificar que el filtro funciona correctamente.

### Postcondiciones:

1. El filtro se aplica correctamente.
2. Solo se muestran ideas que coinciden con el estado seleccionado.
3. El contador muestra el número correcto de resultados.
4. El usuario puede cambiar el filtro o limpiarlo para ver todas las ideas nuevamente.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.4 Casos de Prueba - Módulo de Inventario**

#### **CP-INV-001: Crear Producto Terminado**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Inventario |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Producto Terminado |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero crear un nuevo producto terminado en el inventario para gestionar los productos finales disponibles en el sistema. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-INV-001 - Crear Producto Terminado | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU09 – Crear Producto Terminado | **MÓDULO.** | Inventario |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que se puede crear un nuevo producto terminado con todos los campos requeridos, asegurando que el código sea único y que el producto se registre correctamente en el sistema con estado inicial "activo". |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario con permisos de inventario autenticado (Supervisor QA o Administrador).
2. Existe al menos una categoría de tipo "producto_terminado" en el sistema.
3. El usuario está en el módulo de Inventario.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Código | PROT-001 | Válido |
| Nombre | Proteína Whey Premium | Válido |
| Descripción | Proteína de suero de leche | Válido |
| Categoría | [ID de categoría existente tipo producto_terminado] | Válido |
| Unidad de Medida | kg | Válido |

| Respuesta Esperada de la aplicación | El producto se crea exitosamente. Aparece en el listado de productos. El código es único y no existe duplicado. El estado inicial es "activo". Se muestra mensaje de éxito. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a "Inventario" → "Productos".
2. Hacer clic en el botón "Nuevo Producto".
3. Completar el formulario:
   - Código: "PROT-001"
   - Nombre: "Proteína Whey Premium"
   - Descripción: "Proteína de suero de leche"
   - Categoría: Seleccionar categoría de tipo "producto_terminado" del dropdown
   - Unidad de Medida: Seleccionar "kg" del dropdown
4. Hacer clic en el botón "Guardar".
5. Verificar que se muestra mensaje de éxito.
6. Verificar que el producto aparece en el listado.
7. Verificar que el código es único.

### Postcondiciones:

1. El producto se crea exitosamente en la base de datos.
2. El producto aparece en el listado de productos.
3. El código "PROT-001" es único y no existe duplicado.
4. El estado inicial del producto es "activo".
5. Se registra el usuario creador y la fecha de creación.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-INV-002: Validar Código Único de Producto**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Inventario |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Producto Terminado |
| --- | --- |
| Descripción: | Como sistema, quiero asegurar que cada producto tenga un código único para mantener la integridad de los datos y evitar duplicados. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-INV-002 - Validar Código Único de Producto | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU09 – Crear Producto Terminado | **MÓDULO.** | Inventario |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema valida que no se pueden crear dos productos con el mismo código, mostrando un mensaje de error apropiado cuando se intenta usar un código duplicado. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Existe un producto con código "PROT-001" en el sistema.
2. Usuario autenticado con permisos para crear productos.
3. El usuario está en la pantalla de creación de nuevo producto.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Código | PROT-001 | Inválido (duplicado) |
| Nombre | Proteína Whey Premium 2 | Válido |
| Descripción | Otra proteína | Válido |
| Categoría | [ID de categoría existente] | Válido |

| Respuesta Esperada de la aplicación | El sistema muestra error: "El código del producto ya existe" o mensaje similar. El producto NO se crea. El formulario permanece abierto con los datos ingresados. El usuario puede corregir el código y volver a intentar. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a "Inventario" → "Productos".
2. Hacer clic en "Nuevo Producto".
3. Completar el formulario:
   - Código: "PROT-001" (código ya existente)
   - Nombre: "Proteína Whey Premium 2"
   - Descripción: "Otra proteína"
   - Categoría: Seleccionar categoría
   - Unidad de Medida: "kg"
4. Intentar guardar el producto.
5. Verificar que se muestra mensaje de error.
6. Verificar que el producto no se crea.
7. Verificar que el formulario permanece abierto.

### Postcondiciones:

1. El producto NO se crea en la base de datos.
2. Se muestra mensaje de error apropiado.
3. El formulario permanece abierto con los datos ingresados.
4. El usuario puede corregir el código y volver a intentar.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-INV-003: Crear Materia Prima**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Inventario |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Materia Prima |
| --- | --- |
| Descripción: | Como Supervisor Calidad, quiero registrar una nueva materia prima recibida para gestionar el inventario de materias primas. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-INV-003 - Crear Materia Prima | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU10 – Crear Materia Prima | **MÓDULO.** | Inventario |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que se puede crear una nueva materia prima con todos los campos requeridos, asegurando que el código sea único y que la materia prima se registre correctamente en el sistema. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Supervisor Calidad autenticado.
2. Existe categoría de tipo "materia_prima" en el sistema.
3. El usuario está en el módulo de Inventario.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Código | MP-001 | Válido |
| Nombre | Proteína de Suero Concentrada | Válido |
| Descripción | Materia prima proteica | Válido |
| Categoría | [ID de categoría tipo materia_prima] | Válido |
| Unidad de Medida | kg | Válido |

| Respuesta Esperada de la aplicación | La materia prima se crea exitosamente. Aparece en el listado de materias primas. El código es único. Se muestra mensaje de éxito. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a "Inventario" → "Materia Prima".
2. Hacer clic en el botón "Nueva Materia Prima".
3. Completar el formulario:
   - Código: "MP-001"
   - Nombre: "Proteína de Suero Concentrada"
   - Descripción: "Materia prima proteica"
   - Categoría: Seleccionar categoría de tipo "materia_prima" del dropdown
   - Unidad de Medida: Seleccionar "kg" del dropdown
4. Hacer clic en el botón "Guardar".
5. Verificar que se muestra mensaje de éxito.
6. Verificar que la materia prima aparece en el listado.
7. Verificar que el código es único.

### Postcondiciones:

1. La materia prima se crea exitosamente en la base de datos.
2. La materia prima aparece en el listado de materias primas.
3. El código "MP-001" es único.
4. Se registra el usuario creador y la fecha de creación.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-INV-004: Buscar Productos por Texto**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Inventario |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Buscar Productos |
| --- | --- |
| Descripción: | Como usuario, quiero buscar productos por nombre o código para encontrarlos rápidamente y mejorar la eficiencia en la gestión del inventario. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-INV-004 - Buscar Productos por Texto | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU11 – Buscar Productos | **MÓDULO.** | Inventario |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que la búsqueda de productos funciona correctamente, mostrando solo los productos que contienen el texto buscado en nombre o código, siendo case-insensitive y mostrando un contador de resultados. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Existen productos en el sistema (algunos con "Whey" en nombre o código, otros sin).
2. Usuario autenticado con permisos para ver productos.
3. El usuario está en el módulo "Inventario" → "Productos".

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Texto de Búsqueda | Whey | Válido |
| Productos en sistema | Múltiples productos (algunos con "Whey", otros sin) | Válido |

| Respuesta Esperada de la aplicación | Se muestran solo productos que contienen "Whey" en nombre o código. La búsqueda es case-insensitive (funciona con "whey", "WHEY", "Whey"). Se muestra contador de resultados. Los productos que no contienen "Whey" no se muestran. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a "Inventario" → "Productos".
2. Verificar el listado completo de productos (sin búsqueda).
3. Contar cuántos productos contienen "Whey" en nombre o código.
4. Ingresar texto de búsqueda: "Whey" en el campo de búsqueda.
5. Verificar que el listado se actualiza automáticamente (o presionar Enter/Buscar).
6. Verificar que solo se muestran productos que contienen "Whey".
7. Verificar que se muestra contador de resultados.
8. Probar con "whey" (minúsculas) para verificar case-insensitive.
9. Probar con "WHEY" (mayúsculas) para verificar case-insensitive.
10. Limpiar la búsqueda y verificar que se muestran todos los productos nuevamente.

### Postcondiciones:

1. La búsqueda funciona correctamente.
2. Solo se muestran productos que coinciden con el texto buscado.
3. El contador muestra el número correcto de resultados.
4. La búsqueda es case-insensitive.
5. El usuario puede limpiar la búsqueda para ver todos los productos.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.5 Casos de Prueba - Módulo de Producción / Proceso (BOMs)**

#### **CP-BOM-001: Crear BOM para un Producto**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Producción / Proceso (BOMs) |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear BOM (Bill of Materials) |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero crear un BOM para un producto especificando los materiales y cantidades requeridas para definir la fórmula de producción. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-BOM-001 - Crear BOM para un Producto | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU03 – Crear BOM | **MÓDULO.** | Producción / Proceso (BOMs) |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que se puede crear un BOM (Bill of Materials) para un producto, agregando items con materiales, cantidades y porcentajes que sumen 100%, y que el BOM se guarda correctamente con estado "borrador". |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Supervisor QA autenticado.
2. Existe un producto en el inventario (Producto ID: 1).
3. Existen materiales en el inventario (al menos 3 materiales).
4. El usuario está en el módulo "Producción / Proceso".

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Producto ID | 1 | Válido |
| Versión | 1.0 | Válido |
| Material 1 | [ID Material 1] | Válido |
| Material 1 - Cantidad | 100mg | Válido |
| Material 1 - Porcentaje | 50% | Válido |
| Material 2 | [ID Material 2] | Válido |
| Material 2 - Cantidad | 80mg | Válido |
| Material 2 - Porcentaje | 40% | Válido |
| Material 3 | [ID Material 3] | Válido |
| Material 3 - Cantidad | 20mg | Válido |
| Material 3 - Porcentaje | 10% | Válido |
| Suma Porcentajes | 100% | Válido |

| Respuesta Esperada de la aplicación | El BOM se crea con estado "borrador". Los items se guardan correctamente. Los porcentajes suman 100%. Se puede ver el BOM en el historial del producto. Se muestra mensaje de éxito. |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a "Producción / Proceso".
2. Seleccionar un producto del listado (Producto ID: 1).
3. Hacer clic en el botón "Crear BOM".
4. Ingresar versión: "1.0" en el campo correspondiente.
5. Agregar items al BOM:
   - Material 1: Seleccionar del dropdown, Cantidad: 100mg, Porcentaje: 50%
   - Material 2: Seleccionar del dropdown, Cantidad: 80mg, Porcentaje: 40%
   - Material 3: Seleccionar del dropdown, Cantidad: 20mg, Porcentaje: 10%
6. Verificar que los porcentajes suman 100%.
7. Guardar el BOM.
8. Verificar que se muestra mensaje de éxito.
9. Verificar que el BOM aparece en el historial del producto.

### Postcondiciones:

1. El BOM se crea exitosamente en la base de datos.
2. El BOM tiene estado "borrador".
3. Los items del BOM se guardan correctamente.
4. Los porcentajes suman exactamente 100%.
5. El BOM está disponible en el historial del producto.
6. Se registra el usuario creador y la fecha de creación.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-BOM-002: Validar que Porcentajes de BOM Sumen 100%**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Producción / Proceso (BOMs) |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear BOM (Bill of Materials) |
| --- | --- |
| Descripción: | Como sistema, quiero asegurar que los porcentajes de un BOM sumen exactamente 100% para garantizar la integridad de la fórmula y cumplir con normativas BPM. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-BOM-002 - Validar que Porcentajes de BOM Sumen 100% | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU03 – Crear BOM | **MÓDULO.** | Producción / Proceso (BOMs) |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema valida que los porcentajes de un BOM sumen exactamente 100% antes de permitir guardar, rechazando BOMs con porcentajes que no sumen 100% y aceptando solo aquellos que cumplan esta condición. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario autenticado con permisos para crear BOMs (Supervisor QA o Administrador).
2. Existe un producto en el inventario.
3. Existen materiales en el inventario.
4. El usuario está en la pantalla de creación/edición de BOM.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Material 1 - Porcentaje | 50% | Válido (Caso 3) / Inválido (Caso 1 y 2) |
| Material 2 - Porcentaje | 30% (Caso 1), 40% (Caso 2 y 3) | Válido (Caso 3) / Inválido (Caso 1 y 2) |
| Material 3 - Porcentaje | 15% (Caso 1 y 2), 10% (Caso 3) | Válido (Caso 3) / Inválido (Caso 1 y 2) |
| Suma Total | 95% (Caso 1), 105% (Caso 2), 100% (Caso 3) | Válido (Caso 3) / Inválido (Caso 1 y 2) |

| Respuesta Esperada de la aplicación | Caso 1 (95%): Error "Los porcentajes deben sumar 100%". El BOM no se guarda.<br>Caso 2 (105%): Error "Los porcentajes deben sumar 100%". El BOM no se guarda.<br>Caso 3 (100%): El BOM se guarda exitosamente. |
| --- | --- |

### Pasos de la Prueba:

**Caso 1: Porcentajes suman menos de 100% (95%)**
1. Crear BOM con items:
   - Material 1: 50%
   - Material 2: 30%
   - Material 3: 15%
2. Verificar que la suma total es 95%.
3. Intentar guardar el BOM.
4. Verificar mensaje de error.

**Caso 2: Porcentajes suman más de 100% (105%)**
1. Crear BOM con items:
   - Material 1: 50%
   - Material 2: 40%
   - Material 3: 15%
2. Verificar que la suma total es 105%.
3. Intentar guardar el BOM.
4. Verificar mensaje de error.

**Caso 3: Porcentajes suman exactamente 100%**
1. Crear BOM con items:
   - Material 1: 50%
   - Material 2: 40%
   - Material 3: 10%
2. Verificar que la suma total es 100%.
3. Guardar el BOM.
4. Verificar que se guarda exitosamente.

### Postcondiciones:

**Caso 1 y 2:**
1. El BOM NO se guarda en la base de datos.
2. Se muestra mensaje de error al usuario.
3. El formulario permanece abierto con los datos ingresados.

**Caso 3:**
1. El BOM se guarda exitosamente en la base de datos.
2. Se muestra mensaje de éxito.
3. El BOM queda disponible para aprobación.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-BOM-003: Aprobar BOM**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Producción / Proceso (BOMs) |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Aprobar BOM |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero aprobar un BOM para que pueda ser usado en producción y garantizar que cumple con los requisitos de calidad. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-BOM-003 - Aprobar BOM | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU12 – Aprobar BOM | **MÓDULO.** | Producción / Proceso (BOMs) |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Supervisor QA puede aprobar un BOM en estado "borrador" con porcentajes válidos, cambiando su estado a "aprobado" y registrando la información de aprobación. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Supervisor QA autenticado.
2. Existe un BOM en estado "borrador" con porcentajes válidos (suman 100%).
3. El BOM tiene items correctamente configurados.
4. El usuario tiene permisos para aprobar BOMs.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| BOM ID | 1 | Válido |
| Estado Anterior | borrador | Válido |
| Estado Nuevo | aprobado | Válido |
| Justificación | BOM validado y aprobado para producción | Válido |

| Respuesta Esperada de la aplicación | El estado del BOM cambia a "aprobado". Se registra el usuario aprobador. Se registra la fecha de aprobación. El BOM queda disponible para producción. Se muestra mensaje de éxito. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Supervisor QA.
2. Navegar al BOM (BOM ID: 1).
3. Verificar que el BOM está en estado "borrador".
4. Verificar que los porcentajes suman 100%.
5. Hacer clic en el botón "Aprobar BOM".
6. Ingresar justificación en el campo correspondiente: "BOM validado y aprobado para producción".
7. Confirmar la aprobación.
8. Verificar que se muestra mensaje de éxito.
9. Verificar que el estado del BOM cambió a "aprobado".
10. Verificar que se registró el usuario aprobador y la fecha.

### Postcondiciones:

1. El estado del BOM cambia a "aprobado" en la base de datos.
2. Se registra el usuario aprobador.
3. Se registra la fecha de aprobación.
4. Se registra la justificación de aprobación.
5. El BOM queda disponible para producción.
6. El BOM no puede ser editado directamente (requiere nueva versión).

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-BOM-004: Ver Historial de Versiones de BOM**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Producción / Proceso (BOMs) |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Ver Historial de BOM |
| --- | --- |
| Descripción: | Como Supervisor QA, quiero ver todas las versiones de BOM de un producto para rastrear cambios y mantener un historial completo de las modificaciones. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-BOM-004 - Ver Historial de Versiones de BOM | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU13 – Ver Historial de BOM | **MÓDULO.** | Producción / Proceso (BOMs) |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que se puede ver el historial completo de versiones de BOM para un producto, mostrando todas las versiones con su información (número, estado, fecha, creador) y permitiendo ver el detalle de cada versión. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Producto con múltiples versiones de BOM en el sistema (versiones 1.0, 1.1, 2.0).
2. Usuario autenticado con permisos para ver BOMs.
3. El usuario está en el módulo de Producción / Proceso.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Producto ID | 1 | Válido |
| Versiones Existentes | 1.0, 1.1, 2.0 | Válido |

| Respuesta Esperada de la aplicación | Se muestra lista de todas las versiones de BOM. Cada versión muestra: número de versión, estado, fecha de creación, creador. Se puede ver detalle de cada versión. Las versiones se muestran ordenadas (más reciente primero o por número de versión). |
| --- | --- |

### Pasos de la Prueba:

1. Navegar a un producto que tenga múltiples versiones de BOM (Producto ID: 1).
2. Hacer clic en el botón o enlace "Ver Historial de BOM".
3. Verificar que se muestra una lista de todas las versiones.
4. Verificar que cada versión muestra:
   - Número de versión (1.0, 1.1, 2.0)
   - Estado (borrador, aprobado, etc.)
   - Fecha de creación
   - Usuario creador
5. Hacer clic en una versión para ver su detalle.
6. Verificar que se muestra el detalle completo de la versión seleccionada.
7. Verificar que se pueden ver los items del BOM en cada versión.

### Postcondiciones:

1. Se muestra el historial completo de versiones.
2. Cada versión muestra toda su información relevante.
3. El usuario puede navegar entre versiones.
4. El usuario puede ver el detalle de cada versión.
5. El historial está ordenado correctamente.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.6 Casos de Prueba - Módulo de Pruebas / Control de Calidad**

#### **CP-PRUEBA-001: Crear Prueba Vinculada a Idea**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Pruebas / Control de Calidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Crear Prueba de Laboratorio |
| --- | --- |
| Descripción: | Como Analista de Laboratorio, quiero crear una prueba de laboratorio para una idea asignada para realizar los análisis necesarios y registrar los resultados. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PRUEBA-001 - Crear Prueba Vinculada a Idea | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU14 – Crear Prueba de Laboratorio | **MÓDULO.** | Pruebas / Control de Calidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Analista puede crear una prueba vinculada a una idea asignada, completando todos los campos requeridos y asegurando que la prueba se registre correctamente con estado "pendiente". |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Analista de Laboratorio autenticado.
2. Existe una idea asignada al analista en estado "en_prueba".
3. El usuario tiene permisos para crear pruebas.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Idea ID | 1 | Válido |
| Código Muestra | MU-2024-001 | Válido |
| Tipo Prueba | Control de Calidad | Válido |
| Descripción | Análisis completo del producto | Válido |
| Equipos Utilizados | HPLC-001, BAL-002 | Válido |
| Pruebas Requeridas | Lista de parámetros (pH, Humedad, Proteína) | Válido |

| Respuesta Esperada de la aplicación | La prueba se crea con estado "pendiente". La prueba queda vinculada a la idea. Aparece en el listado de pruebas del analista. Se puede ver el detalle de la prueba. Se muestra mensaje de éxito. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Analista de Laboratorio.
2. Navegar a "Pruebas / Control de Calidad".
3. Hacer clic en el botón "Nueva Prueba".
4. Seleccionar una idea asignada del dropdown (Idea ID: 1).
5. Completar el formulario:
   - Código Muestra: "MU-2024-001"
   - Tipo Prueba: Seleccionar "Control de Calidad" del dropdown
   - Descripción: "Análisis completo del producto"
   - Equipos Utilizados: "HPLC-001, BAL-002"
   - Pruebas Requeridas: Ingresar lista de parámetros (pH, Humedad, Proteína)
6. Hacer clic en el botón "Guardar".
7. Verificar que se muestra mensaje de éxito.
8. Verificar que la prueba aparece en el listado.
9. Verificar que la prueba está vinculada a la idea.

### Postcondiciones:

1. La prueba se crea exitosamente en la base de datos.
2. La prueba tiene estado "pendiente".
3. La prueba queda vinculada a la idea seleccionada.
4. La prueba aparece en el listado de pruebas del analista.
5. Se registra el usuario creador y la fecha de creación.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-PRUEBA-002: Agregar Resultado Analítico a Prueba**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Pruebas / Control de Calidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Agregar Resultado Analítico |
| --- | --- |
| Descripción: | Como Analista, quiero registrar los resultados de los análisis de laboratorio para documentar los valores obtenidos y evaluar el cumplimiento de especificaciones. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PRUEBA-002 - Agregar Resultado Analítico a Prueba | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU04 – Agregar Resultado Analítico | **MÓDULO.** | Pruebas / Control de Calidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Analista puede agregar resultados analíticos a una prueba en estado "en_proceso", y que el sistema evalúa automáticamente si el resultado cumple con la especificación definida. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Existe una prueba en estado "en_proceso".
2. La prueba tiene pruebas requeridas definidas.
3. El usuario Analista está autenticado.
4. El usuario tiene permisos para agregar resultados.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Parámetro | pH | Válido |
| Especificación | 6.5 - 7.5 | Válido (rango) |
| Resultado | 7.2 | Válido (dentro del rango) |
| Unidad | pH | Válido |

| Respuesta Esperada de la aplicación | El resultado se agrega a la prueba. El sistema evalúa automáticamente si cumple la especificación. Se marca como "Cumple" (ya que 7.2 está dentro del rango 6.5-7.5). El resultado aparece en la lista de resultados de la prueba. |
| --- | --- |

### Pasos de la Prueba:

1. Seleccionar una prueba en estado "en_proceso" del listado.
2. Hacer clic en "Ver Detalle" o abrir el detalle de la prueba.
3. Hacer clic en el botón "Agregar Resultado".
4. Completar el formulario:
   - Parámetro: "pH"
   - Especificación: "6.5 - 7.5"
   - Resultado: "7.2"
   - Unidad: "pH"
5. Hacer clic en "Guardar" o "Agregar Resultado".
6. Verificar que el resultado se agrega a la prueba.
7. Verificar que el sistema evalúa automáticamente el cumplimiento.
8. Verificar que se marca como "Cumple".
9. Verificar que el resultado aparece en la lista de resultados.

### Postcondiciones:

1. El resultado se guarda correctamente en la base de datos.
2. El resultado se marca como "Cumple" o "No cumple" según corresponda.
3. El resultado aparece en la lista de resultados de la prueba.
4. Se registra la fecha y hora del resultado.
5. Se registra el usuario que agregó el resultado.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-PRUEBA-003: Evaluación Automática de Cumplimiento de Especificación**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Pruebas / Control de Calidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Agregar Resultado Analítico |
| --- | --- |
| Descripción: | Como sistema, quiero evaluar automáticamente si los resultados de las pruebas cumplen con las especificaciones definidas para detectar OOS (Out of Specification) y garantizar el control de calidad. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PRUEBA-003 - Evaluación Automática de Cumplimiento de Especificación | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU04 – Agregar Resultado Analítico | **MÓDULO.** | Pruebas / Control de Calidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema evalúa automáticamente si un resultado cumple con la especificación definida, comparando valores numéricos contra rangos, límites superiores e inferiores, y marcando correctamente como "Cumple" o "OOS" según corresponda. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Existe una prueba en estado "en_proceso".
2. La prueba tiene especificaciones definidas en el campo "Pruebas Requeridas".
3. El usuario Analista está autenticado.
4. El usuario tiene permisos para agregar resultados.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Parámetro 1 - Nombre | pH | Válido |
| Parámetro 1 - Especificación | 6.5 - 7.5 | Rango |
| Parámetro 1 - Resultado | 7.2 | Válido (dentro del rango) |
| Parámetro 2 - Nombre | Humedad | Válido |
| Parámetro 2 - Especificación | ≤ 5% | Límite superior |
| Parámetro 2 - Resultado | 4.5% | Válido (cumple) |
| Parámetro 3 - Nombre | Proteína | Válido |
| Parámetro 3 - Especificación | ≥ 80% | Límite inferior |
| Parámetro 3 - Resultado | 75% | Inválido (no cumple) |

| Respuesta Esperada de la aplicación | Caso 1 (pH 7.2 en rango 6.5-7.5): Se marca como "Cumple" ✓<br>Caso 2 (Humedad 4.5% ≤ 5%): Se marca como "Cumple" ✓<br>Caso 3 (Proteína 75% ≥ 80%): Se marca como "No cumple" ✗ (OOS) |
| --- | --- |

### Pasos de la Prueba:

**Caso 1: Resultado dentro de rango**
1. Seleccionar una prueba en estado "en_proceso".
2. Hacer clic en "Agregar Resultado".
3. Completar formulario:
   - Parámetro: "pH"
   - Especificación: "6.5 - 7.5"
   - Resultado: "7.2"
   - Unidad: "pH"
4. Guardar resultado.
5. Verificar que se marca como "Cumple".

**Caso 2: Resultado cumple límite superior**
1. Agregar nuevo resultado a la misma prueba.
2. Completar formulario:
   - Parámetro: "Humedad"
   - Especificación: "≤ 5%"
   - Resultado: "4.5%"
   - Unidad: "%"
3. Guardar resultado.
4. Verificar que se marca como "Cumple".

**Caso 3: Resultado no cumple límite inferior (OOS)**
1. Agregar nuevo resultado a la misma prueba.
2. Completar formulario:
   - Parámetro: "Proteína"
   - Especificación: "≥ 80%"
   - Resultado: "75%"
   - Unidad: "%"
3. Guardar resultado.
4. Verificar que se marca como "No cumple" (OOS).
5. Verificar que el estado de la prueba cambia a "OOS".

### Postcondiciones:

**Caso 1 y 2:**
1. El resultado se guarda correctamente.
2. El resultado se marca como "Cumple".
3. El resultado aparece en la lista de resultados de la prueba.

**Caso 3:**
1. El resultado se guarda correctamente.
2. El resultado se marca como "No cumple" (OOS).
3. El estado de la prueba cambia automáticamente a "OOS".
4. Se muestra alerta visual indicando OOS.
5. Se requiere investigación del resultado.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-PRUEBA-004: Cambio Automático de Estado de Prueba a Completada**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Pruebas / Control de Calidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Cambio Automático de Estado de Prueba |
| --- | --- |
| Descripción: | Como sistema, quiero cambiar automáticamente el estado de la prueba a "completada" cuando todas las pruebas requeridas están completas y cumplen con las especificaciones. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PRUEBA-004 - Cambio Automático de Estado de Prueba a Completada | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU15 – Cambio Automático de Estado | **MÓDULO.** | Pruebas / Control de Calidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que cuando todas las pruebas requeridas tienen resultados y todos cumplen con las especificaciones, la prueba cambia automáticamente a estado "completada" sin intervención manual. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Prueba en estado "en_proceso".
2. Prueba tiene 3 pruebas requeridas definidas (parámetros).
3. El usuario Analista está autenticado.
4. El usuario tiene permisos para agregar resultados.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Prueba ID | 1 | Válido |
| Parámetro 1 | pH | Válido |
| Parámetro 1 - Resultado | 7.2 (cumple) | Válido |
| Parámetro 2 | Humedad | Válido |
| Parámetro 2 - Resultado | 4.5% (cumple) | Válido |
| Parámetro 3 | Proteína | Válido |
| Parámetro 3 - Resultado | 82% (cumple) | Válido |

| Respuesta Esperada de la aplicación | Después del tercer resultado, el estado cambia automáticamente a "completada". El estado de la idea asociada se actualiza si corresponde. Se muestra mensaje de éxito. La prueba queda marcada como completada. |
| --- | --- |

### Pasos de la Prueba:

1. Seleccionar una prueba en estado "en_proceso" con 3 pruebas requeridas definidas.
2. Agregar resultado para parámetro 1 (pH: 7.2, cumple especificación).
3. Verificar que el estado sigue siendo "en_proceso".
4. Agregar resultado para parámetro 2 (Humedad: 4.5%, cumple especificación).
5. Verificar que el estado sigue siendo "en_proceso".
6. Agregar resultado para parámetro 3 (Proteína: 82%, cumple especificación).
7. Verificar que el estado cambia automáticamente a "completada".
8. Verificar que se muestra mensaje de éxito.
9. Verificar que el estado de la idea asociada se actualiza si corresponde.

### Postcondiciones:

1. El estado de la prueba cambia automáticamente a "completada".
2. Todos los resultados cumplen con las especificaciones.
3. Se registra la fecha de finalización.
4. El estado de la idea asociada se actualiza si corresponde.
5. La prueba queda disponible para revisión.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-PRUEBA-005: Detección Automática de OOS (Out of Specification)**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Pruebas / Control de Calidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Detección Automática de OOS |
| --- | --- |
| Descripción: | Como sistema, quiero detectar automáticamente cuando un resultado está fuera de especificación (OOS) para alertar inmediatamente y requerir investigación. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PRUEBA-005 - Detección Automática de OOS (Out of Specification) | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU16 – Detección de OOS | **MÓDULO.** | Pruebas / Control de Calidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que cuando un resultado no cumple la especificación definida, el sistema detecta automáticamente el OOS, marca el resultado como "No cumple", cambia el estado de la prueba a "OOS" y muestra alertas visuales. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Prueba en estado "en_proceso" con especificaciones definidas.
2. El usuario Analista está autenticado.
3. El usuario tiene permisos para agregar resultados.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Parámetro | pH | Válido |
| Especificación | 6.5 - 7.5 | Válido (rango) |
| Resultado | 8.2 | Inválido (fuera de rango) |
| Unidad | pH | Válido |

| Respuesta Esperada de la aplicación | El resultado se marca como "No cumple" (OOS). El estado de la prueba cambia automáticamente a "OOS". Se muestra alerta visual indicando OOS. Se requiere investigación del resultado. Se registra el OOS en el historial. |
| --- | --- |

### Pasos de la Prueba:

1. Seleccionar una prueba en estado "en_proceso" con especificaciones definidas.
2. Hacer clic en "Agregar Resultado".
3. Completar el formulario:
   - Parámetro: "pH"
   - Especificación: "6.5 - 7.5"
   - Resultado: "8.2" (fuera del rango)
   - Unidad: "pH"
4. Guardar el resultado.
5. Verificar que el resultado se marca como "No cumple" (OOS).
6. Verificar que el estado de la prueba cambia automáticamente a "OOS".
7. Verificar que se muestra alerta visual (mensaje de advertencia, color rojo, etc.).
8. Verificar que se requiere investigación del resultado.

### Postcondiciones:

1. El resultado se guarda correctamente.
2. El resultado se marca como "No cumple" (OOS).
3. El estado de la prueba cambia automáticamente a "OOS".
4. Se muestra alerta visual indicando OOS.
5. Se registra el OOS en el historial de la prueba.
6. Se requiere investigación y acción correctiva.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.7 Casos de Prueba - Módulo de Roles y Permisos**

#### **CP-ROL-001: Verificar Acceso Restringido por Rol - Analista**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Roles y Permisos |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Control de Acceso por Rol |
| --- | --- |
| Descripción: | Como sistema, quiero restringir el acceso a módulos según el rol del usuario para garantizar la seguridad y cumplir con los requisitos de permisos. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-ROL-001 - Verificar Acceso Restringido por Rol - Analista | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU17 – Control de Acceso | **MÓDULO.** | Roles y Permisos |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Analista no puede acceder a módulos restringidos, tanto desde el Sidebar como por URL directa, y que solo se muestran los módulos permitidos según su rol. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Analista de Laboratorio existe en la base de datos.
2. Usuario Analista está autenticado.
3. El sistema tiene módulos con restricciones de acceso configuradas.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Rol | ANALISTA_LABORATORIO | Válido |
| URL Restringida | /configuracion | Inválido (restringido) |
| Módulos Permitidos | Dashboard, Asignado, Pruebas, Historial | Válido |

| Respuesta Esperada de la aplicación | El módulo "Configuración" no aparece en el Sidebar. Si se accede por URL directa, se muestra mensaje "Acceso Restringido" o redirección. Solo se muestran módulos permitidos: Dashboard, Asignado, Pruebas, Historial. |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Analista de Laboratorio.
2. Verificar el Sidebar y confirmar que el módulo "Configuración" NO aparece.
3. Verificar que solo se muestran módulos permitidos: Dashboard, Asignado, Pruebas, Historial.
4. Intentar acceder directamente a URL de módulo restringido: `/configuracion`.
5. Verificar que se muestra mensaje "Acceso Restringido" o redirección.
6. Verificar que no se puede acceder al contenido del módulo restringido.
7. Probar con otros módulos restringidos si existen.

### Postcondiciones:

1. El Analista solo puede acceder a módulos permitidos según su rol.
2. Los módulos restringidos no son accesibles.
3. Se muestra mensaje apropiado cuando se intenta acceder a módulos restringidos.
4. La seguridad del sistema está garantizada.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-ROL-002: Verificar que Analista Solo Ve Ideas Asignadas**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Roles y Permisos |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Filtrado de Ideas por Asignación |
| --- | --- |
| Descripción: | Como Analista, solo debo ver las ideas que me fueron asignadas para realizar pruebas, asegurando que no tenga acceso a información que no me corresponde. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-ROL-002 - Verificar que Analista Solo Ve Ideas Asignadas | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU18 – Filtrado de Ideas | **MÓDULO.** | Roles y Permisos |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que un Analista solo puede ver las ideas que le fueron asignadas, no pudiendo acceder a ideas asignadas a otros analistas o ideas en otros estados que no le corresponden. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Usuario Analista de Laboratorio autenticado (Analista ID: 5).
2. Existen ideas en el sistema:
   - 2 ideas asignadas al analista en estado "en_prueba"
   - 8 ideas asignadas a otros analistas o en otros estados
3. Total de ideas en sistema: 10.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Analista ID | 5 | Válido |
| Ideas Asignadas al Analista | 2 | Válido |
| Ideas Totales en Sistema | 10 | Válido |

| Respuesta Esperada de la aplicación | Solo se muestran ideas asignadas al analista (2 ideas). Solo se muestran ideas en estado "en_prueba". No se muestran ideas de otros analistas. No se muestran ideas en otros estados. El contador muestra el número correcto (2). |
| --- | --- |

### Pasos de la Prueba:

1. Iniciar sesión como Analista de Laboratorio (Analista ID: 5).
2. Navegar al módulo "Asignado" (Ideas).
3. Verificar el listado de ideas.
4. Contar cuántas ideas se muestran.
5. Verificar que solo se muestran ideas asignadas al analista.
6. Verificar que solo se muestran ideas en estado "en_prueba".
7. Verificar que NO se muestran ideas de otros analistas.
8. Verificar que NO se muestran ideas en otros estados.
9. Verificar que el contador muestra el número correcto (2).

### Postcondiciones:

1. El Analista solo ve ideas asignadas a él.
2. El Analista solo ve ideas en estado "en_prueba".
3. No se muestran ideas de otros analistas.
4. No se muestran ideas en otros estados.
5. La seguridad de datos está garantizada.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.8 Casos de Prueba - Integración y Rendimiento**

#### **CP-INT-001: Integración Frontend-Backend**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Integración |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Integración Frontend-Backend |
| --- | --- |
| Descripción: | Como sistema, quiero que el frontend y backend se comuniquen correctamente para garantizar que todas las operaciones se ejecuten correctamente y los datos se sincronicen adecuadamente. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-INT-001 - Integración Frontend-Backend | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU19 – Integración Sistema | **MÓDULO.** | Integración |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el frontend se comunica correctamente con el backend, enviando peticiones HTTP con token JWT válido, recibiendo respuestas correctas y actualizando la interfaz de usuario adecuadamente. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Frontend ejecutándose y accesible.
2. Backend ejecutándose y accesible.
3. Usuario autenticado con token JWT válido.
4. Herramientas de desarrollo (DevTools) disponibles.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Endpoint | POST /api/products | Válido |
| Token JWT | Válido en header Authorization | Válido |
| Datos del Producto | Código, Nombre, Descripción, etc. | Válido |

| Respuesta Esperada de la aplicación | La petición se envía correctamente con token JWT en header Authorization. El backend responde con código 200/201. Los datos se actualizan en el frontend. No hay errores de CORS. No hay errores de JavaScript en consola. |
| --- | --- |

### Pasos de la Prueba:

1. Abrir el sistema en el navegador con DevTools abierto (pestaña Network).
2. Iniciar sesión para obtener token JWT válido.
3. Realizar una operación desde el frontend (ej: crear producto).
4. Verificar en DevTools que la petición HTTP se envía correctamente:
   - Método: POST
   - URL: `/api/products`
   - Headers: Incluye `Authorization: Bearer <token>`
5. Verificar la respuesta del backend:
   - Código de estado: 200 o 201
   - Body: Contiene los datos del producto creado
6. Verificar que los datos se actualizan en el frontend.
7. Verificar que no hay errores de CORS en la consola.
8. Verificar que no hay errores de JavaScript en la consola.

### Postcondiciones:

1. La comunicación frontend-backend funciona correctamente.
2. Las peticiones incluyen el token JWT válido.
3. El backend responde correctamente.
4. Los datos se sincronizan entre frontend y backend.
5. No hay errores de CORS o JavaScript.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

#### **CP-PERF-001: Carga de Listado de Productos con Gran Volumen**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Rendimiento |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Carga de Listado con Gran Volumen |
| --- | --- |
| Descripción: | Como usuario, quiero que el sistema cargue rápidamente incluso con muchos productos para mantener una experiencia de usuario fluida y eficiente. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-PERF-001 - Carga de Listado de Productos con Gran Volumen | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU20 – Rendimiento del Sistema | **MÓDULO.** | Rendimiento |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar el rendimiento al cargar un listado con muchos productos (1000+), asegurando que el tiempo de carga sea aceptable, la interfaz permanezca responsive y no se congele durante la carga. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Base de datos con 1000+ productos registrados.
2. Usuario autenticado con permisos para ver productos.
3. Herramientas para medir tiempo de carga disponibles (DevTools).
4. El sistema está en funcionamiento.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Cantidad de Productos | 1000+ | Válido |
| Módulo | Inventario → Productos | Válido |

| Respuesta Esperada de la aplicación | El listado carga en menos de 3 segundos. La interfaz permanece responsive durante la carga. Se puede interactuar mientras carga (si aplica paginación). No hay congelamiento de la interfaz. Los productos se muestran correctamente. |
| --- | --- |

### Pasos de la Prueba:

1. Preparar base de datos con 1000+ productos (si no existe).
2. Abrir DevTools (pestaña Network y Performance).
3. Navegar a "Inventario" → "Productos".
4. Iniciar medición de tiempo (usar Performance API o DevTools).
5. Verificar tiempo de carga del listado.
6. Verificar que la interfaz no se congela durante la carga.
7. Verificar que se puede interactuar con la interfaz (si aplica paginación).
8. Verificar que los productos se muestran correctamente.
9. Verificar uso de memoria y CPU durante la carga.

### Postcondiciones:

1. El listado carga en tiempo aceptable (< 3 segundos).
2. La interfaz permanece responsive.
3. No hay congelamiento de la interfaz.
4. Los productos se muestran correctamente.
5. El rendimiento es aceptable para el usuario.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

### **6.9 Casos de Prueba - Compatibilidad**

#### **CP-COMP-001: Compatibilidad con Navegadores**

---

## Información General

| Proyecto: | Omega Lab - PLM/LIMS |
| --- | --- |
| Módulo: | Compatibilidad |
| Versión: | 1.0 |
| Fecha de asignación: | dd/mm/aaaa |
| Responsable: | [Nombre del tester] |
| Fecha de entrega: | dd/mm/aaaa |

## Información Funcionalidad

| Nombre: | Compatibilidad Multi-Navegador |
| --- | --- |
| Descripción: | Como usuario, quiero que el sistema funcione correctamente en mi navegador preferido para tener flexibilidad en la elección de herramientas. |

## Información Caso de Prueba

| **CASO DE PRUEBA No - Nombre.** | CP-COMP-001 - Compatibilidad con Navegadores | **FECHA PLANEACIÓN** | dd/mm/aaaa |
| --- | --- | --- | --- |
| **HISTORIA DE USUARIO O CASO DE USO:** | HU21 – Compatibilidad | **MÓDULO.** | Compatibilidad |
| **RESPONSABLE PLANEACIÓN** | [Nombre del planner] | **DESARROLLADOR** | [Nombre del desarrollador] |

| Descripción del caso de prueba | Verificar que el sistema funciona correctamente en diferentes navegadores (Chrome, Firefox, Edge, Safari), asegurando que no hay errores de JavaScript, el diseño se ve correctamente y las funcionalidades operan igual en todos los navegadores. |
| --- | --- |

## Planeación Caso de Prueba

### Precondiciones:

1. Sistema desplegado y accesible.
2. Navegadores disponibles: Chrome, Firefox, Edge, Safari (versiones recientes).
3. Usuario autenticado con credenciales válidas.

### Datos de Entrada

| Campo | Valor | Tipo Escenario |
| --- | --- | --- |
| Navegadores | Chrome, Firefox, Edge, Safari | Válido |
| Operaciones | Login, Navegación, CRUD básico | Válido |

| Respuesta Esperada de la aplicación | El sistema funciona correctamente en todos los navegadores. No hay errores de JavaScript en la consola. El diseño se ve correctamente en todos los navegadores. Las funcionalidades operan igual en todos los navegadores. No hay diferencias significativas en el comportamiento. |
| --- | --- |

### Pasos de la Prueba:

**Chrome:**
1. Abrir el sistema en Chrome.
2. Realizar login.
3. Navegar por los módulos principales.
4. Realizar operaciones básicas (crear, editar, ver).
5. Verificar consola de JavaScript (no debe haber errores).
6. Verificar que el diseño se ve correctamente.

**Firefox:**
1. Abrir el sistema en Firefox.
2. Repetir los pasos 2-6 de Chrome.

**Edge:**
1. Abrir el sistema en Edge.
2. Repetir los pasos 2-6 de Chrome.

**Safari:**
1. Abrir el sistema en Safari.
2. Repetir los pasos 2-6 de Chrome.

### Postcondiciones:

1. El sistema funciona correctamente en todos los navegadores probados.
2. No hay errores de JavaScript en ningún navegador.
3. El diseño se ve correctamente en todos los navegadores.
4. Las funcionalidades operan igual en todos los navegadores.
5. La compatibilidad multi-navegador está garantizada.

## Ejecución Caso de Prueba

| Versión de la Prueba | 1.0 | **Fecha de Realización** | dd/mm/aaaa |
| --- | --- | --- | --- |

| Respuesta del Sistema | _(A completar en Fase 2)_ |
| --- | --- |
| Defectos y Desviaciones | _(A completar en Fase 2)_ |
| Veredicto (Aprobó/No Aprobó) | _(A completar en Fase 2)_ |

---

---

## **Resumen de Casos de Prueba**

| **Módulo** | **Casos de Prueba** | **Prioridad Alta** | **Prioridad Media** | **Prioridad Baja** |
| --- | --- | --- | --- | --- |
| Autenticación | 3 | 3 | 0 | 0 |
| Dashboard | 2 | 2 | 0 | 0 |
| Ideas / Nuevas Fórmulas | 5 | 2 | 3 | 0 |
| Inventario | 4 | 2 | 2 | 0 |
| Producción / BOMs | 4 | 3 | 1 | 0 |
| Pruebas / Control de Calidad | 5 | 5 | 0 | 0 |
| Roles y Permisos | 2 | 2 | 0 | 0 |
| Integración | 1 | 1 | 0 | 0 |
| Rendimiento | 1 | 0 | 1 | 0 |
| Compatibilidad | 1 | 0 | 1 | 0 |
| **TOTAL** | **28** | **20** | **8** | **0** |

---

**Nota**: Este documento contiene los casos de prueba principales. **TODOS los 28 casos de prueba están documentados con el formato completo detallado** (Información General, Funcionalidad, Planeación y Ejecución), listos para la fase de planeación y ejecución.

**Formato de Casos de Prueba:**

Cada caso de prueba debe incluir las siguientes secciones:

1. **Información General**: Proyecto, Módulo, Versión, Fechas y Responsables
2. **Información Funcionalidad**: Nombre y descripción de la funcionalidad
3. **Información Caso de Prueba**: ID, Nombre, Historia de Usuario, Módulo, Responsables
4. **Planeación Caso de Prueba**: Precondiciones, Datos de Entrada, Respuesta Esperada, Pasos de la Prueba, Postcondiciones
5. **Ejecución Caso de Prueba**: Versión de la Prueba, Fecha de Realización, Respuesta del Sistema, Defectos y Desviaciones, Veredicto

Durante la ejecución (Fase 2), se pueden agregar casos adicionales según se identifiquen necesidades o problemas durante las pruebas. Cada ejecución debe documentarse con su versión correspondiente.

**Fin del Documento**

