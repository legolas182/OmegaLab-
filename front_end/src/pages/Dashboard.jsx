import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'

const Dashboard = () => {
  const { user } = useAuth()
  
  // Si no hay usuario, no mostrar nada
  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-text-muted">Cargando...</div>
      </div>
    )
  }

  const isAdmin = hasAnyRole(user, 'ADMINISTRADOR')
  const isSupervisorQA = hasAnyRole(user, 'SUPERVISOR_QA')
  const isSupervisorCalidad = hasAnyRole(user, 'SUPERVISOR_CALIDAD')
  const isAnalistaLab = hasAnyRole(user, 'ANALISTA_LABORATORIO')

  // Determinar el rol principal del usuario
  const userRole = isAdmin ? 'ADMINISTRADOR' : 
                   isSupervisorQA ? 'SUPERVISOR_QA' : 
                   isSupervisorCalidad ? 'SUPERVISOR_CALIDAD' : 
                   isAnalistaLab ? 'ANALISTA_LABORATORIO' : null

  const getDashboardTitle = () => {
    if (isAdmin) return 'Dashboard Administrativo'
    if (isSupervisorQA) return 'Dashboard Supervisor QA'
    if (isSupervisorCalidad) return 'Dashboard Supervisor Calidad'
    if (isAnalistaLab) return 'Dashboard Analista de Laboratorio'
    return 'Dashboard'
  }

  const getDashboardDescription = () => {
    if (isAdmin) return 'Vista completa del sistema y gestión administrativa'
    if (isSupervisorQA) return 'Vista consolidada de QA, fórmulas y cumplimiento BPM'
    if (isSupervisorCalidad) return 'Gestión de materias primas, análisis y trazabilidad'
    if (isAnalistaLab) return 'Ideas asignadas para pruebas de laboratorio'
    return 'Vista consolidada del estado operativo'
  }

  // Si no se detecta el rol, mostrar mensaje de error
  if (!userRole) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-light text-lg font-semibold mb-2">Error al cargar el dashboard</p>
          <p className="text-text-muted text-sm">No se pudo determinar el rol del usuario.</p>
          <p className="text-text-muted text-xs mt-2">Rol detectado: {user?.rol || 'No disponible'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">{getDashboardTitle()}</h1>
          <p className="text-text-muted text-sm mt-1">{getDashboardDescription()}</p>
        </div>
      </div>

      {/* Contenido del Dashboard - Listo para llenar con datos reales */}
      <div className="rounded-lg bg-card-dark border border-border-dark p-12">
                    <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-text-muted mb-4">dashboard</span>
          <p className="text-text-light text-lg font-semibold mb-2">Dashboard en construcción</p>
          <p className="text-text-muted text-sm">Este espacio está listo para mostrar datos reales del sistema.</p>
                </div>
              </div>
    </div>
  )
}

export default Dashboard
