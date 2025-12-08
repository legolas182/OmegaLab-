# PT-ECU-01. Especificación Detallada de Casos de Uso

## Omega Lab - PLM/LIMS

---

## **4. Especificación de Casos de Uso**

### **4.1 Iniciar Sesión**

| **NOMBRE:** | Iniciar Sesión |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a los usuarios acceder al sistema mediante credenciales válidas (email y contraseña). El sistema valida las credenciales, genera un token JWT y redirige al usuario a su dashboard según su rol. |
| **ACTORES:** | Administrador, Supervisor QA, Supervisor Calidad, Analista de Laboratorio |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | El usuario debe tener una cuenta registrada en el sistema. El usuario debe tener estado "activo". El sistema debe estar en funcionamiento. |
| **FLUJO NORMAL:** | El usuario accede a la página de login.

El usuario ingresa su email y contraseña.

El sistema valida las credenciales.

El sistema genera un token JWT.

El sistema redirige al usuario a su dashboard según su rol.

El sistema muestra el nombre y rol del usuario en el Sidebar. |
| **FLUJOS ALTERNOS:** | A. Si las credenciales son inválidas, el sistema muestra mensaje de error y el usuario permanece en la página de login.

B. Si el usuario olvidó su contraseña, puede seleccionar "¿Olvidaste tu contraseña?" y seguir el proceso de recuperación (funcionalidad ideal). |
| **POSTCONDICIÓN:** | El usuario está autenticado en el sistema. Se genera un token JWT válido que se almacena en localStorage. El usuario puede acceder a los módulos según su rol. |
| **EXCEPCIONES:** | El usuario introduce credenciales incorrectas (se muestra mensaje de error).

Fallo en la conexión con el servidor de autenticación.

Token JWT no se puede generar por error del sistema. |

---

### **4.2 Crear Nueva Idea**

| **NOMBRE:** | Crear Nueva Idea |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA o Administrador crear una nueva idea de producto para iniciar el proceso de desarrollo. La idea se crea con estado inicial "generada" y puede ser editada, aprobada o asignada posteriormente. |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario autenticado con rol Supervisor QA o Administrador. Debe existir al menos una categoría en el sistema. El usuario debe tener permisos para crear ideas. |
| **FLUJO NORMAL:** | El usuario navega al módulo "Ideas / Nuevas Fórmulas".

El usuario hace clic en "Nueva Idea".

El usuario completa el formulario (título, descripción, categoría, prioridad, objetivo).

El usuario hace clic en "Guardar".

El sistema valida los campos requeridos.

El sistema crea la idea con estado "generada".

El sistema muestra mensaje de éxito.

La idea aparece en el listado. |
| **FLUJOS ALTERNOS:** | A. Si faltan campos requeridos, el sistema muestra mensajes de error específicos y el formulario permanece abierto para corrección. |
| **POSTCONDICIÓN:** | La idea se crea exitosamente en la base de datos. El estado inicial de la idea es "generada". Se registra el usuario creador y la fecha de creación. La idea aparece en el listado de ideas. |
| **EXCEPCIONES:** | Error al guardar en la base de datos.

Categoría seleccionada no existe o fue eliminada.

Usuario no tiene permisos suficientes para crear ideas. |

---

### **4.3 Asignar Idea a Analista**

| **NOMBRE:** | Asignar Idea a Analista |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA asignar una idea en estado "aprobada" a un Analista de Laboratorio para que realice las pruebas de laboratorio necesarias. El estado de la idea cambia a "en_prueba" y el analista puede verla en su módulo "Asignado". |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario Supervisor QA autenticado. Debe existir una idea en estado "aprobada". Debe existir al menos un usuario con rol Analista de Laboratorio en el sistema. |
| **FLUJO NORMAL:** | El Supervisor QA navega al módulo "Ideas".

El Supervisor QA selecciona una idea en estado "aprobada".

El Supervisor QA cambia el estado a "en_prueba".

El Supervisor QA selecciona un analista de la lista disponible.

El Supervisor QA confirma el cambio.

El sistema actualiza el estado de la idea a "en_prueba".

El sistema asigna la idea al analista seleccionado.

El analista puede ver la idea en su Dashboard y módulo "Asignado". |
| **FLUJOS ALTERNOS:** | A. Si la idea no está en estado "aprobada", el sistema muestra mensaje de error indicando que solo se pueden asignar ideas aprobadas.

B. Si no hay analistas disponibles, el sistema muestra mensaje indicando que no hay analistas en el sistema. |
| **POSTCONDICIÓN:** | El estado de la idea cambia a "en_prueba". La idea queda asignada al analista seleccionado. Se registra el usuario que realizó la asignación y la fecha. El analista puede ver la idea en su módulo "Asignado". |
| **EXCEPCIONES:** | Error al actualizar el estado de la idea en la base de datos.

El analista seleccionado fue eliminado o desactivado durante el proceso.

La idea fue modificada por otro usuario simultáneamente. |

---

### **4.4 Crear BOM para Producto**

| **NOMBRE:** | Crear BOM para Producto |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA crear un BOM (Bill of Materials) para un producto, especificando los materiales, cantidades y porcentajes requeridos. El sistema valida que los porcentajes sumen exactamente 100% antes de permitir guardar. |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario Supervisor QA autenticado. Debe existir un producto en el inventario. Deben existir materiales en el inventario. |
| **FLUJO NORMAL:** | El Supervisor QA navega a "Producción / Proceso".

El Supervisor QA selecciona un producto.

El Supervisor QA hace clic en "Crear BOM".

El Supervisor QA ingresa la versión del BOM.

El Supervisor QA agrega items al BOM (material, cantidad, porcentaje).

El sistema calcula y muestra la suma de porcentajes en tiempo real.

El Supervisor QA verifica que los porcentajes sumen 100%.

El Supervisor QA guarda el BOM.

El sistema valida que los porcentajes sumen 100%.

El sistema crea el BOM con estado "borrador".

El sistema muestra mensaje de éxito. |
| **FLUJOS ALTERNOS:** | A. Si los porcentajes no suman 100%, el sistema muestra error "Los porcentajes deben sumar 100%" y el BOM no se guarda, permitiendo al usuario corregir los valores.

B. Si el producto seleccionado ya tiene un BOM aprobado, el sistema permite crear una nueva versión del BOM. |
| **POSTCONDICIÓN:** | El BOM se crea exitosamente con estado "borrador". Los items del BOM se guardan correctamente. Los porcentajes suman exactamente 100%. El BOM está disponible en el historial del producto. |
| **EXCEPCIONES:** | Error al guardar el BOM en la base de datos.

Material seleccionado no existe o fue eliminado.

El producto fue eliminado durante el proceso de creación del BOM.

Error en el cálculo de porcentajes. |

---

### **4.5 Validar Porcentajes de BOM**

| **NOMBRE:** | Validar Porcentajes de BOM |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | El sistema valida automáticamente que los porcentajes de un BOM sumen exactamente 100% antes de permitir guardar, rechazando BOMs con porcentajes que no cumplan esta condición. |
| **ACTORES:** | Sistema |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario está creando o editando un BOM. El BOM tiene al menos un item con porcentaje definido. |
| **FLUJO NORMAL:** | El usuario agrega items al BOM con porcentajes.

El sistema calcula la suma de porcentajes en tiempo real.

El usuario intenta guardar el BOM.

El sistema valida que la suma sea exactamente 100%.

Si la suma es 100%, el sistema guarda el BOM.

Si la suma no es 100%, el sistema muestra error y no guarda. |
| **FLUJOS ALTERNOS:** | A. Si la suma es menor a 100%, el sistema muestra error "Los porcentajes deben sumar 100%" y no guarda, mostrando la diferencia faltante.

B. Si la suma es mayor a 100%, el sistema muestra error "Los porcentajes deben sumar 100%" y no guarda, mostrando el exceso. |
| **POSTCONDICIÓN:** | Si la validación pasa: El BOM se guarda exitosamente. Si la validación falla: El BOM no se guarda y se muestra mensaje de error con la información necesaria para corregir. |
| **EXCEPCIONES:** | Error en el cálculo de la suma de porcentajes.

Valores de porcentaje inválidos (negativos, nulos, o mayores a 100% individualmente).

Error al validar debido a problemas de precisión numérica. |

---

### **4.6 Crear Prueba de Laboratorio**

| **NOMBRE:** | Crear Prueba de Laboratorio |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Analista de Laboratorio crear una prueba de laboratorio vinculada a una idea asignada. La prueba se crea con estado "pendiente" y puede ser actualizada con resultados posteriormente. |
| **ACTORES:** | Analista de Laboratorio |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario Analista de Laboratorio autenticado. Debe existir una idea asignada al analista en estado "en_prueba". |
| **FLUJO NORMAL:** | El Analista navega a "Pruebas / Control de Calidad".

El Analista hace clic en "Nueva Prueba".

El Analista selecciona una idea asignada del dropdown.

El Analista completa el formulario (código muestra, tipo prueba, descripción, equipos utilizados, pruebas requeridas).

El Analista guarda la prueba.

El sistema crea la prueba con estado "pendiente".

El sistema vincula la prueba a la idea seleccionada.

El sistema muestra mensaje de éxito.

La prueba aparece en el listado del analista. |
| **FLUJOS ALTERNOS:** | A. Si no hay ideas asignadas disponibles, el sistema muestra mensaje indicando que no hay ideas asignadas y sugiere contactar al Supervisor QA. |
| **POSTCONDICIÓN:** | La prueba se crea exitosamente con estado "pendiente". La prueba queda vinculada a la idea seleccionada. Se registra el usuario creador y la fecha de creación. La prueba aparece en el listado de pruebas del analista. |
| **EXCEPCIONES:** | Error al guardar la prueba en la base de datos.

La idea asignada fue eliminada o desasignada durante el proceso.

Error al vincular la prueba con la idea. |

---

### **4.7 Agregar Resultado Analítico**

| **NOMBRE:** | Agregar Resultado Analítico |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Analista agregar resultados analíticos a una prueba en estado "en_proceso". El sistema evalúa automáticamente si el resultado cumple con la especificación definida y marca como "Cumple" o "OOS" según corresponda. |
| **ACTORES:** | Analista de Laboratorio |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Debe existir una prueba en estado "en_proceso". La prueba debe tener pruebas requeridas definidas. El usuario Analista debe estar autenticado. |
| **FLUJO NORMAL:** | El Analista selecciona una prueba en estado "en_proceso".

El Analista hace clic en "Ver Detalle".

El Analista hace clic en "Agregar Resultado".

El Analista completa el formulario (parámetro, especificación, resultado, unidad).

El Analista guarda el resultado.

El sistema guarda el resultado.

El sistema evalúa automáticamente si cumple la especificación.

El sistema marca el resultado como "Cumple" o "No cumple" (OOS).

Si es OOS, el sistema cambia el estado de la prueba a "OOS".

El resultado aparece en la lista de resultados de la prueba. |
| **FLUJOS ALTERNOS:** | A. Si el resultado cumple la especificación, el resultado se marca como "Cumple" ✓ y la prueba continúa en estado "en_proceso".

B. Si el resultado no cumple la especificación, el resultado se marca como "No cumple" (OOS) ✗ y el estado de la prueba cambia automáticamente a "OOS", mostrando una alerta visual. |
| **POSTCONDICIÓN:** | El resultado se guarda correctamente. El resultado se marca como "Cumple" o "OOS" según corresponda. Si es OOS, el estado de la prueba cambia a "OOS" y se muestra alerta. El resultado aparece en la lista de resultados. |
| **EXCEPCIONES:** | Error al guardar el resultado en la base de datos.

Error en la evaluación automática del cumplimiento (especificación inválida o formato incorrecto).

La prueba fue modificada o eliminada durante el proceso.

Valor del resultado en formato incorrecto. |

---

### **4.8 Evaluación Automática de Cumplimiento**

| **NOMBRE:** | Evaluación Automática de Cumplimiento |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | El sistema evalúa automáticamente si un resultado cumple con la especificación definida, comparando valores numéricos contra rangos, límites superiores (≤) e inferiores (≥), y marcando correctamente como "Cumple" o "OOS". |
| **ACTORES:** | Sistema |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Se ha agregado un resultado analítico a una prueba. El resultado tiene especificación y valor definidos. |
| **FLUJO NORMAL:** | El sistema recibe un resultado con especificación y valor.

El sistema parsea la especificación (rango, límite superior, límite inferior).

El sistema compara el valor con la especificación.

Si el valor cumple, el sistema marca como "Cumple".

Si el valor no cumple, el sistema marca como "OOS".

Si es OOS, el sistema cambia el estado de la prueba a "OOS".

El sistema muestra alerta visual si es OOS. |
| **FLUJOS ALTERNOS:** | A. Si la especificación es un rango (ej: "6.5 - 7.5"), el sistema verifica que el valor esté dentro del rango.

B. Si la especificación es un límite superior (ej: "≤ 5%"), el sistema verifica que el valor sea menor o igual al límite.

C. Si la especificación es un límite inferior (ej: "≥ 80%"), el sistema verifica que el valor sea mayor o igual al límite. |
| **POSTCONDICIÓN:** | El resultado se marca correctamente como "Cumple" o "OOS". Si es OOS, el estado de la prueba cambia a "OOS". Se muestra alerta visual si es OOS. |
| **EXCEPCIONES:** | Error al parsear la especificación (formato inválido).

Valor del resultado no es numérico o está en formato incorrecto.

Error en la comparación debido a problemas de precisión numérica.

Especificación en formato no reconocido por el sistema. |

---

### **4.9 Generar Idea con IA**

| **NOMBRE:** | Generar Idea con IA |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA generar una idea mejorada desde un producto existente usando OpenAI API. El sistema genera automáticamente una idea con título, descripción, BOM modificado y pruebas requeridas sugeridas. |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario Supervisor QA autenticado. Debe existir un producto en el inventario. El producto debe tener un BOM aprobado. OpenAI API debe estar configurada y accesible. |
| **FLUJO NORMAL:** | El Supervisor QA navega al módulo "IA / Simulación".

El Supervisor QA selecciona un producto del inventario.

El Supervisor QA ingresa un objetivo (ej: "Crear versión sin azúcar").

El Supervisor QA hace clic en "Generar Idea".

El sistema muestra indicador de carga.

El sistema llama a OpenAI API con el producto y objetivo.

El sistema recibe respuesta de IA con idea generada.

El sistema crea automáticamente la idea en el sistema.

El sistema muestra el detalle de la idea generada. |
| **FLUJOS ALTERNOS:** | A. Si hay error en la API de OpenAI, el sistema muestra mensaje de error y permite crear una idea básica manualmente.

B. Si la respuesta de IA es inválida o no se puede parsear, el sistema crea una idea básica con los datos disponibles y muestra advertencia. |
| **POSTCONDICIÓN:** | La idea se crea automáticamente en el sistema. La idea contiene información generada por IA. El estado inicial de la idea es "generada". Se registra que fue generada usando IA. |
| **EXCEPCIONES:** | Error de conexión con OpenAI API.

OpenAI API retorna error o timeout.

Respuesta de IA en formato no parseable.

El producto seleccionado fue eliminado durante el proceso.

Error al guardar la idea generada en la base de datos. |

---

### **4.10 Control de Acceso Basado en Roles**

| **NOMBRE:** | Control de Acceso Basado en Roles |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | El sistema restringe el acceso a módulos y funcionalidades según el rol del usuario autenticado. Los usuarios solo pueden acceder a los módulos permitidos según su rol. |
| **ACTORES:** | Sistema |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario autenticado en el sistema. El usuario tiene un rol asignado. |
| **FLUJO NORMAL:** | El usuario inicia sesión exitosamente.

El sistema identifica el rol del usuario.

El sistema filtra los módulos disponibles según el rol.

El sistema muestra solo los módulos permitidos en el Sidebar.

Si el usuario intenta acceder a un módulo restringido por URL directa, el sistema muestra mensaje "Acceso Restringido" y redirige al Dashboard. |
| **FLUJOS ALTERNOS:** | A. Si el usuario Analista intenta acceder a /configuracion, el sistema muestra mensaje "Acceso Restringido" y redirige al Dashboard.

B. Si el usuario Supervisor QA accede a módulos permitidos, el sistema permite el acceso normalmente. |
| **POSTCONDICIÓN:** | El usuario solo ve módulos permitidos según su rol. Los módulos restringidos no son accesibles. La seguridad del sistema está garantizada. |
| **EXCEPCIONES:** | Error al identificar el rol del usuario.

Token JWT inválido o expirado.

Error al filtrar módulos según permisos.

Usuario sin rol asignado. |

---

### **4.11 Ver Historial de Versiones de BOM**

| **NOMBRE:** | Ver Historial de Versiones de BOM |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA ver todas las versiones de BOM de un producto para rastrear cambios y mantener un historial completo de las modificaciones. |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Media |
| **PRECONDICIONES:** | Producto con múltiples versiones de BOM en el sistema. Usuario autenticado con permisos para ver BOMs. |
| **FLUJO NORMAL:** | El Supervisor QA navega a un producto que tenga múltiples versiones de BOM.

El Supervisor QA hace clic en "Ver Historial de BOM".

El sistema muestra una lista de todas las versiones.

Cada versión muestra: número de versión, estado, fecha de creación, usuario creador.

El Supervisor QA puede hacer clic en una versión para ver su detalle.

El sistema muestra el detalle completo de la versión seleccionada.

El sistema muestra los items del BOM en cada versión. |
| **FLUJOS ALTERNOS:** | A. Si el producto no tiene versiones de BOM, el sistema muestra mensaje indicando que no hay historial disponible. |
| **POSTCONDICIÓN:** | Se muestra el historial completo de versiones. Cada versión muestra toda su información relevante. El usuario puede navegar entre versiones. El historial está ordenado correctamente (por fecha o versión). |
| **EXCEPCIONES:** | Error al cargar el historial desde la base de datos.

El producto fue eliminado durante la visualización.

Error al mostrar el detalle de una versión específica. |

---

### **4.12 Aprobar BOM**

| **NOMBRE:** | Aprobar BOM |
| --- | --- |
| **AUTORES:** | [Nombre del autor] |
| **DESCRIPCIÓN:** | Permite a un Supervisor QA aprobar un BOM en estado "borrador" con porcentajes válidos, cambiando su estado a "aprobado" y registrando la justificación técnica. |
| **ACTORES:** | Supervisor QA, Administrador |
| **PRIORIDAD:** | Alta |
| **PRECONDICIONES:** | Usuario Supervisor QA autenticado. Debe existir un BOM en estado "borrador" con porcentajes válidos (suman 100%). |
| **FLUJO NORMAL:** | El Supervisor QA navega al BOM.

El Supervisor QA verifica que el BOM está en estado "borrador".

El Supervisor QA verifica que los porcentajes suman 100%.

El Supervisor QA hace clic en "Aprobar BOM".

El Supervisor QA ingresa justificación técnica.

El Supervisor QA confirma la aprobación.

El sistema cambia el estado del BOM a "aprobado".

El sistema registra el usuario aprobador, fecha y justificación.

El sistema muestra mensaje de éxito.

El BOM queda disponible para producción. |
| **FLUJOS ALTERNOS:** | A. Si los porcentajes no suman 100%, el sistema muestra error y no permite aprobar, sugiriendo corregir los porcentajes primero. |
| **POSTCONDICIÓN:** | El estado del BOM cambia a "aprobado". Se registra el usuario aprobador, fecha y justificación técnica. El BOM queda disponible para producción. El BOM no puede ser editado directamente (requiere crear nueva versión). |
| **EXCEPCIONES:** | Error al actualizar el estado del BOM en la base de datos.

El BOM fue modificado por otro usuario durante el proceso.

Error al registrar la justificación técnica.

El BOM fue eliminado durante el proceso de aprobación. |

---

**Fin del Documento**
