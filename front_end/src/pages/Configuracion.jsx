import { useState } from 'react'

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('usuarios')

  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Dr. Juan Pérez', email: 'juan.perez@omegalab.com', rol: 'ADMINISTRADOR', estado: 'Activo' },
    { id: 2, nombre: 'Ana García', email: 'ana.garcia@omegalab.com', rol: 'SUPERVISOR_QA', estado: 'Activo' },
    { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@omegalab.com', rol: 'SUPERVISOR_CALIDAD', estado: 'Activo' },
    { id: 4, nombre: 'María López', email: 'maria.lopez@omegalab.com', rol: 'ANALISTA_LABORATORIO', estado: 'Activo' }
  ])

  const [equipos, setEquipos] = useState([
    { id: 'BAL-001', nombre: 'Balanza Analítica', ubicacion: 'Laboratorio', calibracion: '30/06/2024', estado: 'Calibrado' },
    { id: 'HPLC-001', nombre: 'Cromatógrafo HPLC', ubicacion: 'Laboratorio', calibracion: '15/05/2024', estado: 'Calibrado' },
    { id: 'LINEA-A', nombre: 'Línea de Producción A', ubicacion: 'Planta', calibracion: '20/03/2024', estado: 'Vence Pronto' }
  ])

  const [validaciones, setValidaciones] = useState([
    { id: 'VAL-001', sistema: 'Sistema de Agua Purificada', estado: 'Validado', fecha: '15/12/2023', proxima: '15/12/2024' },
    { id: 'VAL-002', sistema: 'Sistema de Ventilación', estado: 'Validado', fecha: '20/11/2023', proxima: '20/11/2024' },
    { id: 'VAL-003', sistema: 'Aire Comprimido', estado: 'Pendiente', fecha: '-', proxima: '01/02/2024' }
  ])

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-text-muted text-sm mt-1">Administración de usuarios, roles, equipos y validaciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border-dark">
        <div className="flex gap-8">
          {['usuarios', 'equipos', 'validaciones'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-light'
              }`}
            >
              <p className="text-sm font-bold capitalize">{tab}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Usuarios y Roles */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-text-light text-xl font-semibold">Gestión de Usuarios y Roles</h2>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Nuevo Usuario
            </button>
          </div>

          <div className="rounded-lg bg-card-dark border border-border-dark">
            <div className="p-4 border-b border-border-dark">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                className="w-full h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Nombre</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Email</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Rol</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Estado</th>
                    <th className="text-right p-4 text-text-muted text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-border-dark hover:bg-border-dark/50">
                      <td className="p-4 text-text-light">{usuario.nombre}</td>
                      <td className="p-4 text-text-muted text-sm">{usuario.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          usuario.estado === 'Activo' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                        }`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 rounded bg-primary/20 text-primary text-sm hover:bg-primary/30">
                          Editar Permisos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trazabilidad de Roles */}
          <div className="rounded-lg bg-card-dark border border-border-dark p-6">
            <h3 className="text-text-light font-semibold mb-4">Trazabilidad de Roles y Formación</h3>
            <p className="text-text-muted text-sm mb-4">
              Omega Lab registra quién hace qué, con qué permisos y con qué formación mínima.
              Esto permite demostrar en auditorías que solo personal calificado y autorizado ejecuta
              actividades críticas de PLM / LIMS.
            </p>
            <div className="space-y-3">
              {[
                {
                  rol: 'ADMINISTRADOR DEL SISTEMA',
                  actividades: [
                    'Configuración de módulos y parámetros',
                    'Alta / baja de usuarios y asignación de roles',
                    'Gestión de integridad de datos y copias de seguridad'
                  ],
                  requiere: 'Formación en sistemas computarizados y cGMP; designación formal como administrador'
                },
                {
                  rol: 'SUPERVISOR QA',
                  actividades: [
                    'Revisión y aprobación de fórmulas',
                    'Liberación / rechazo de lotes desde QA',
                    'Acceso a toda la trazabilidad de cambios y resultados'
                  ],
                  requiere: 'Profesional QA con formación en BPM/BPL y manejo de documentación regulatoria'
                },
                {
                  rol: 'SUPERVISOR DE CALIDAD',
                  actividades: [
                    'Recepción y liberación de materias primas',
                    'Gestión de lotes y desviaciones',
                    'Revisión de resultados analíticos de control de calidad'
                  ],
                  requiere: 'Jefe / Supervisor de Calidad con formación en control de calidad y trazabilidad'
                },
                {
                  rol: 'ANALISTA DE LABORATORIO',
                  actividades: [
                    'Ejecución de pruebas analíticas y registro de resultados',
                    'Documentación de OOS y comentarios técnicos',
                    'Soporte a desarrollo de formulaciones'
                  ],
                  requiere: 'Analista con formación técnica en laboratorio y entrenamiento documentado en el LIMS'
                }
              ].map((rol, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-text-light font-medium">{rol.rol}</p>
                      <p className="text-text-muted text-xs">Formación / requisito mínimo: {rol.requiere}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-text-muted text-xs mb-1">Actividades Autorizadas en el Sistema:</p>
                    <div className="flex flex-wrap gap-2">
                      {rol.actividades.map((act, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Equipos */}
      {activeTab === 'equipos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-text-light text-xl font-semibold">Gestión de Equipos</h2>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Nuevo Equipo
            </button>
          </div>

          <div className="rounded-lg bg-card-dark border border-border-dark">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">ID Equipo</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Nombre</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Ubicación</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Próxima Calibración</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Estado</th>
                    <th className="text-right p-4 text-text-muted text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((equipo) => (
                    <tr key={equipo.id} className="border-b border-border-dark hover:bg-border-dark/50">
                      <td className="p-4 text-text-light font-medium">{equipo.id}</td>
                      <td className="p-4 text-text-light">{equipo.nombre}</td>
                      <td className="p-4 text-text-muted text-sm">{equipo.ubicacion}</td>
                      <td className="p-4 text-text-muted text-sm">{equipo.calibracion}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          equipo.estado === 'Calibrado' ? 'bg-success/20 text-success' :
                          equipo.estado === 'Vence Pronto' ? 'bg-warning/20 text-warning' :
                          'bg-danger/20 text-danger'
                        }`}>
                          {equipo.estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 rounded bg-primary/20 text-primary text-sm hover:bg-primary/30">
                          Ver Historial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-card-dark border border-border-dark p-6">
            <h3 className="text-text-light font-semibold mb-4">Vinculación Automática de Equipos</h3>
            <p className="text-text-muted text-sm">
              El sistema vincula automáticamente los resultados analíticos al equipo de medición utilizado,
              garantizando que la calibración esté vigente. Esto mitiga los riesgos de falta de calibración (NC Crítica).
            </p>
          </div>
        </div>
      )}

      {/* Tab: Validaciones */}
      {activeTab === 'validaciones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-text-light text-xl font-semibold">Validación de Sistemas Críticos</h2>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Nueva Validación
            </button>
          </div>

          <div className="rounded-lg bg-card-dark border border-border-dark">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">ID</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Sistema</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Estado</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Última Validación</th>
                    <th className="text-left p-4 text-text-muted text-sm font-semibold">Próxima Validación</th>
                    <th className="text-right p-4 text-text-muted text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {validaciones.map((val) => (
                    <tr key={val.id} className="border-b border-border-dark hover:bg-border-dark/50">
                      <td className="p-4 text-text-light font-medium">{val.id}</td>
                      <td className="p-4 text-text-light">{val.sistema}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          val.estado === 'Validado' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                        }`}>
                          {val.estado}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted text-sm">{val.fecha}</td>
                      <td className="p-4 text-text-muted text-sm">{val.proxima}</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 rounded bg-primary/20 text-primary text-sm hover:bg-primary/30">
                          Ver Documentación
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-warning/10 border border-warning/30 p-6">
            <h3 className="text-warning font-semibold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Validación de Sistemas Computarizados (NC Mayor)
            </h3>
            <p className="text-text-muted text-sm mb-4">
              El sistema debe estar diseñado para permitir la validación, demostrando que garantiza:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-muted text-sm ml-6">
              <li>Conservación de los datos</li>
              <li>Integridad de los datos</li>
              <li>Fiabilidad de los datos</li>
              <li>Accesibilidad de los datos</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Configuracion

