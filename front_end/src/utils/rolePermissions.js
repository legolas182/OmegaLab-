/**
 * Utilidades para manejar permisos basados en roles en el frontend
 */

// Mapeo de roles del backend a nombres legibles
export const ROLE_NAMES = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR_QA: 'Supervisor QA',
  SUPERVISOR_CALIDAD: 'Supervisor Calidad',
  ANALISTA_LABORATORIO: 'Analista de Laboratorio'
};

/**
 * Obtiene el nombre legible de un rol
 * @param {string} role - Rol del backend (ej: 'ADMINISTRADOR')
 * @returns {string} Nombre legible del rol
 */
export const getRoleName = (role) => {
  return ROLE_NAMES[role] || role;
};

/**
 * Verifica si el usuario tiene uno de los roles especificados
 * @param {Object} user - Objeto usuario con propiedad 'rol'
 * @param {string[]} roles - Array de roles a verificar
 * @returns {boolean}
 */
export const hasAnyRole = (user, ...roles) => {
  if (!user || !user.rol) return false;
  // Normalizar el rol del usuario a mayúsculas para comparación
  const userRole = String(user.rol).toUpperCase();
  // Normalizar los roles a verificar a mayúsculas
  const normalizedRoles = roles.map(role => String(role).toUpperCase());
  return normalizedRoles.includes(userRole);
};

/**
 * Verifica si el usuario tiene el rol especificado
 * @param {Object} user - Objeto usuario con propiedad 'rol'
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  return hasAnyRole(user, role);
};

// ========== PERMISOS ESPECÍFICOS POR ROL ==========

/**
 * Verifica si el usuario puede otorgar roles (solo Administrador)
 */
export const canAssignRoles = (user) => {
  return hasRole(user, 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario tiene acceso a fórmulas reales (solo Supervisor QA y Administrador)
 */
export const canAccessRealFormulas = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede recibir materias primas
 */
export const canReceiveRawMaterials = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_CALIDAD', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede ingresar datos de proveedor, lotes y trazabilidad
 */
export const canManageSupplierData = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_CALIDAD', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede gestionar análisis de materias primas
 */
export const canManageRawMaterialAnalysis = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_CALIDAD', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede hacer devoluciones de materias primas no aptas
 */
export const canReturnRawMaterials = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_CALIDAD', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede recibir órdenes de formulación
 */
export const canReceiveFormulationOrders = (user) => {
  return hasAnyRole(user, 'ANALISTA_LABORATORIO', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede ingresar análisis sensorial
 */
export const canEnterSensoryAnalysis = (user) => {
  return hasAnyRole(user, 'ANALISTA_LABORATORIO', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario tiene visión total del sistema
 */
export const hasFullSystemView = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede ver el estado de formulación y quién está operando
 */
export const canViewFormulationStatus = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede ver trazabilidad completa
 */
export const canViewTraceability = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_CALIDAD', 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede gestionar análisis de formulaciones
 * (Solo Supervisor QA y Administrador - Supervisor Calidad NO tiene este permiso)
 */
export const canManageFormulationAnalysis = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede recibir notificaciones de stock, lotes, trazabilidad, etc.
 */
export const canReceiveNotifications = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

/**
 * Verifica si el usuario puede acceder a documentos y reportes
 */
export const canAccessDocumentsAndReports = (user) => {
  return hasAnyRole(user, 'SUPERVISOR_QA', 'ADMINISTRADOR');
};

