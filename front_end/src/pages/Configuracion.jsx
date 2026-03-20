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

  const getRoleStyles = (rol) => {
    const baseStyles = {
      backgroundColor: 'rgba(79, 70, 229, 0.18)',
      textColor: '#FFFFFF',
      borderColor: '#4F46E5'
    }

    switch (rol) {
      case 'ADMINISTRADOR':
      case 'ADMINISTRADOR DEL SISTEMA':
        return {
          backgroundColor: 'rgba(79, 70, 229, 0.18)',
          textColor: '#FFFFFF',
          borderColor: '#4F46E5'
        } // Admin
      case 'ANALISTA_LABORATORIO':
      case 'ANALISTA DE LABORATORIO':
        return {
          backgroundColor: 'rgba(14, 116, 144, 0.18)',
          textColor: '#FFFFFF',
          borderColor: '#0E7490'
        } // Analista Lab
      case 'SUPERVISOR_QA':
      case 'SUPERVISOR QA':
        return {
          backgroundColor: 'rgba(4, 120, 87, 0.18)',
          textColor: '#FFFFFF',
          borderColor: '#047857'
        } // Supervisor QA
      case 'SUPERVISOR_CALIDAD':
      case 'SUPERVISOR DE CALIDAD':
        return {
          backgroundColor: 'rgba(194, 65, 12, 0.18)',
          textColor: '#FFFFFF',
          borderColor: '#C2410C'
        } // Supervisor Calidad
      default:
        return baseStyles
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 shrink-0">
        <div>
          <h1 className="text-text-light text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-text-muted text-xs mt-0.5">Administración de usuarios, roles, equipos y validaciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-border-dark shrink-0">
        <div className="flex gap-6">
          {['usuarios', 'equipos', 'validaciones'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center border-b-2 pb-2 pt-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-light'
              }`}
            >
              <p className="text-xs font-bold capitalize">{tab}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full flex flex-col">
        {/* Tab: Usuarios y Roles */}
        {activeTab === 'usuarios' && (
          <div className="flex-1 overflow-y-auto pr-3 custom-scroll pb-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-text-light text-xl font-semibold">Gestión de Usuarios y Roles</h2>
                <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex shrink-0 transition-colors shadow-lg shadow-primary/20">
                  Nuevo Usuario
                </button>
              </div>

              <div className="rounded-xl bg-card-dark border border-border-dark shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border-dark bg-white/5">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm scale-75">search</span>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      className="w-full bg-slate-950/50 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-text-light focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/50"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr className="border-b border-border-dark shadow-sm">
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Nombre</th>
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Email</th>
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap text-center">Rol</th>
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap text-center">Estado</th>
                        <th className="p-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/30">
                      {usuarios.map((usuario) => {
                        const roleStyles = getRoleStyles(usuario.rol)
                        return (
                          <tr key={usuario.id} className="group cursor-pointer hover:bg-white/5 transition-colors">
                            <td className="p-4 text-text-light font-semibold text-sm whitespace-nowrap leading-none">{usuario.nombre}</td>
                            <td className="p-4 text-text-muted text-sm">{usuario.email}</td>
                            <td className="p-4 text-center">
                              <span
                                className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase border whitespace-nowrap"
                                style={{
                                  backgroundColor: roleStyles.backgroundColor,
                                  color: roleStyles.textColor,
                                  borderColor: roleStyles.borderColor
                                }}
                              >
                                {usuario.rol}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                                  usuario.estado === 'Activo'
                                    ? 'bg-success/20 text-success'
                                    : 'bg-danger/20 text-danger'
                                }`}
                              >
                                {usuario.estado}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="w-9 h-9 rounded-lg bg-primary/0 group-hover:bg-primary/20 text-primary transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">chevron_right</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trazabilidad de Roles */}
              <div className="rounded-xl bg-card-dark border border-border-dark shadow-xl flex flex-col p-6">
                <div className="mb-6">
                  <h3 className="text-text-light font-semibold mb-2 text-lg">Trazabilidad de Roles y Formación</h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Demuestra en auditorías que solo personal calificado ejecuta actividades críticas.
                  </p>
                </div>
                <div className="space-y-4">
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
                ].map((rol, idx) => {
                  const roleStyles = getRoleStyles(rol.rol)
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-lg border flex flex-col gap-4 transition-all hover:brightness-110"
                      style={{
                        backgroundColor: roleStyles.backgroundColor,
                        borderColor: roleStyles.borderColor
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-text-light font-bold text-base" style={{ color: roleStyles.textColor }}>{rol.rol}</p>
                        <p className="text-text-muted text-xs italic bg-slate-900/50 px-3 py-1.5 rounded-md">
                          <span className="font-semibold text-text-light not-italic">Requisito mínimo:</span> {rol.requiere}
                        </p>
                      </div>
                      <div className="w-full h-px bg-white/10" />
                      <div>
                        <p className="text-text-muted text-xs mb-3 font-semibold uppercase tracking-wider">Actividades Autorizadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {rol.actividades.map((act, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-md text-xs border font-medium bg-background-dark/30"
                              style={{
                                color: roleStyles.textColor,
                                borderLeft: `3px solid ${roleStyles.textColor}`,
                                borderColor: `${roleStyles.textColor}40`
                              }}
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Equipos */}
        {activeTab === 'equipos' && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0">
              <h2 className="text-text-light text-xl font-semibold">Gestión de Equipos</h2>
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex shrink-0 transition-colors shadow-lg shadow-primary/20">
                Nuevo Equipo
              </button>
            </div>

            <div className="flex-[2] min-h-0 rounded-xl bg-card-dark border border-border-dark shadow-xl flex flex-col">
              <div className="flex-1 overflow-auto custom-scroll w-full">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="border-b border-border-dark shadow-sm">
                      <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">ID Equipo</th>
                      <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Nombre</th>
                      <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Ubicación</th>
                      <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Próxima Calibración</th>
                      <th className="p-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap text-center">Estado</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/30">
                    {equipos.map((equipo) => (
                      <tr key={equipo.id} className="group cursor-pointer hover:bg-white/5 transition-colors">
                        <td className="p-4 text-text-light font-semibold text-sm whitespace-nowrap leading-none">{equipo.id}</td>
                        <td className="p-4 text-text-light text-sm whitespace-nowrap">{equipo.nombre}</td>
                        <td className="p-4 text-text-muted text-sm whitespace-nowrap">{equipo.ubicacion}</td>
                        <td className="p-4 text-text-muted text-sm whitespace-nowrap">{equipo.calibracion}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase whitespace-nowrap ${
                            equipo.estado === 'Calibrado' ? 'bg-success/20 text-success' :
                            equipo.estado === 'Vence Pronto' ? 'bg-warning/20 text-warning' :
                            'bg-danger/20 text-danger'
                          }`}>
                            {equipo.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="w-8 h-8 rounded-lg bg-primary/0 group-hover:bg-primary/20 text-primary transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-card-dark border border-border-dark p-4 shadow-xl">
              <h3 className="text-text-light font-semibold mb-2 text-lg">Vinculación Automática de Equipos</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                El sistema vincula automáticamente los resultados analíticos al equipo de medición utilizado,
                garantizando que la calibración esté vigente y bloqueando el uso en sistemas no calibrados. Esto mitigará de forma proactiva los riesgos regulatorios.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Validaciones */}
        {activeTab === 'validaciones' && (
          <div className="flex flex-col h-full gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0">
              <h2 className="text-text-light text-xl font-semibold leading-tight">Validación de Sistemas Críticos</h2>
              <button className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex shrink-0 transition-colors shadow-lg shadow-primary/20">
                Nueva Validación
              </button>
            </div>

            <div className="flex-1 min-h-0 rounded-xl bg-card-dark border border-border-dark flex flex-col shadow-xl">
              <div className="flex-1 overflow-auto custom-scroll w-full">
                <table className="w-full text-left">
                  <thead className="bg-white/5 sticky top-0 z-10">
                    <tr className="border-b border-border-dark shadow-sm">
                      <th className="px-6 py-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">ID</th>
                      <th className="px-6 py-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Sistema</th>
                      <th className="px-6 py-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap text-center">Estado</th>
                      <th className="px-6 py-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Última Validación</th>
                      <th className="px-6 py-4 text-text-muted text-xs font-semibold uppercase whitespace-nowrap">Próxima Validación</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/30">
                    {validaciones.map((val) => (
                      <tr key={val.id} className="group cursor-pointer hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-text-light font-semibold text-sm whitespace-nowrap leading-none">{val.id}</td>
                        <td className="px-6 py-4 text-text-light whitespace-normal min-w-[200px] text-sm">{val.sistema}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase whitespace-nowrap ${
                            val.estado === 'Validado' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                          }`}>
                            {val.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-muted text-sm whitespace-nowrap">{val.fecha}</td>
                        <td className="px-6 py-4 text-text-muted text-sm whitespace-nowrap">{val.proxima}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="w-8 h-8 rounded-lg bg-primary/0 group-hover:bg-primary/20 text-primary transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-gradient-to-br from-warning/10 to-orange-500/5 border border-warning/20 p-4 flex flex-col md:flex-row gap-5 items-start shadow-inner mt-1">
              <div className="bg-warning/20 p-3 rounded-xl shrink-0 border border-warning/30 shadow-lg shadow-warning/10 hidden md:block">
                <span className="material-symbols-outlined text-warning text-2xl block">gpp_maybe</span>
              </div>
              <div className="w-full">
                <h3 className="text-warning font-bold mb-2 flex items-center gap-2 text-base">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                  Sistemas Computarizados (NC Mayor)
                </h3>
                <p className="text-text-muted text-xs mb-3 leading-snug">
                  Garantía de cumplimiento y trazabilidad en el ciclo de vida de los datos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: 'Conservación', desc: 'Backups automáticos.', icon: 'save' },
                    { title: 'Integridad', desc: 'Sin alteraciones.', icon: 'verified_user' },
                    { title: 'Fiabilidad', desc: 'Origen exacto.', icon: 'precision_manufacturing' },
                    { title: 'Accesibilidad', desc: 'Audit Trail.', icon: 'visibility' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 bg-card-dark/40 p-2.5 rounded-lg border border-border-dark items-center">
                      <span className="material-symbols-outlined text-primary/70 text-lg leading-none">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-text-light font-medium block leading-none mb-0.5">{item.title}</span>
                        <span className="text-text-muted text-[10px] leading-none">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Configuracion

