<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole, hasFullSystemView, canViewFormulationStatus, canViewTraceability, canManageRawMaterialAnalysis } from '../utils/rolePermissions'
import ideaService from '../services/ideaService'

const Dashboard = () => {
  const { user } = useAuth()
  const [ideasAsignadas, setIdeasAsignadas] = useState([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  
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
  const hasFullView = hasFullSystemView(user)
  const canViewFormulation = canViewFormulationStatus(user)
  const canViewTrace = canViewTraceability(user)
  const canManageRawMaterials = canManageRawMaterialAnalysis(user)

  // Determinar el rol principal del usuario (exclusión mutua)
  const userRole = isAdmin ? 'ADMINISTRADOR' : 
                   isSupervisorQA ? 'SUPERVISOR_QA' : 
                   isSupervisorCalidad ? 'SUPERVISOR_CALIDAD' : 
                   isAnalistaLab ? 'ANALISTA_LABORATORIO' : null

  // Debug: mostrar información del usuario si no se detecta el rol
  if (!userRole && user) {
    console.log('Usuario detectado pero rol no reconocido:', user)
    console.log('Rol del usuario:', user.rol)
    console.log('isAdmin:', isAdmin, 'isSupervisorQA:', isSupervisorQA, 'isSupervisorCalidad:', isSupervisorCalidad, 'isAnalistaLab:', isAnalistaLab)
  }

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

  // Cargar ideas asignadas al analista
  useEffect(() => {
    if (isAnalistaLab && user) {
      loadIdeasAsignadas()
    }
  }, [isAnalistaLab, user])

  const loadIdeasAsignadas = async () => {
    setLoadingIdeas(true)
    try {
      const ideas = await ideaService.getMisIdeas()
      setIdeasAsignadas(ideas)
    } catch (error) {
      console.error('Error al cargar ideas asignadas:', error)
    } finally {
      setLoadingIdeas(false)
    }
  }

  const handleAprobarPrueba = async (ideaId) => {
    try {
      await ideaService.changeEstado(ideaId, 'prueba_aprobada')
      loadIdeasAsignadas()
    } catch (error) {
      console.error('Error al aprobar prueba:', error)
      alert('Error al aprobar prueba: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleRechazarPrueba = async (ideaId) => {
    if (!confirm('¿Estás seguro de rechazar esta prueba? La idea será archivada.')) {
      return
    }
    try {
      await ideaService.changeEstado(ideaId, 'rechazada')
      loadIdeasAsignadas()
    } catch (error) {
      console.error('Error al rechazar prueba:', error)
      alert('Error al rechazar prueba: ' + (error.message || 'Error desconocido'))
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'en_prueba':
        return 'bg-purple-500/20 text-purple-400'
      case 'prueba_aprobada':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'rechazada':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'en_prueba':
        return 'En Prueba'
      case 'prueba_aprobada':
        return 'Aprobación Final'
      case 'rechazada':
        return 'Rechazada'
      default:
        return estado || 'N/A'
    }
  }

  // Calcular estadísticas para el analista
  const ideasEnPrueba = ideasAsignadas.filter(i => i.estado === 'EN_PRUEBA').length
  const ideasAprobadas = ideasAsignadas.filter(i => i.estado === 'PRUEBA_APROBADA').length
  const ideasCompletadasHoy = ideasAsignadas.filter(i => {
    if (i.estado === 'PRUEBA_APROBADA' && i.updatedAt) {
      const fecha = new Date(i.updatedAt)
      const hoy = new Date()
      return fecha.toDateString() === hoy.toDateString()
    }
    return false
  }).length

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

=======
import { Link } from 'react-router-dom'

const Dashboard = () => {
>>>>>>> origin/main
  return (
    <div className="w-full h-full">
      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
<<<<<<< HEAD
          <h1 className="text-gray-900 dark:text-text-light text-3xl font-bold tracking-tight">{getDashboardTitle()}</h1>
          <p className="text-gray-600 dark:text-text-muted text-sm mt-1">{getDashboardDescription()}</p>
=======
          <h1 className="text-gray-900 dark:text-text-light text-3xl font-bold tracking-tight">Dashboard de Calidad</h1>
          <p className="text-gray-600 dark:text-text-muted text-sm mt-1">Vista consolidada del estado operativo y cumplimiento BPM</p>
>>>>>>> origin/main
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-card-dark border border-border-dark text-text-light text-sm font-medium leading-normal tracking-wide hover:bg-border-dark">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            <span className="truncate">Este Mes</span>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Alertas Críticas - Solo para roles con acceso a aprobación */}
      {(userRole === 'ADMINISTRADOR' || userRole === 'SUPERVISOR_QA' || userRole === 'SUPERVISOR_CALIDAD') && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger text-2xl">warning</span>
          <div className="flex-1">
            <p className="text-text-light font-semibold">3 Lotes Pendientes de Liberación</p>
            <p className="text-text-muted text-sm">Requieren revisión y firma de profesional idóneo</p>
          </div>
          <Link to="/aprobacion" className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90">
            Revisar Ahora
          </Link>
        </div>
      )}

      {/* Alerta para Analista de Laboratorio */}
      {userRole === 'ANALISTA_LABORATORIO' && ideasEnPrueba > 0 && (
        <div className="mb-6 rounded-lg bg-purple-500/20 border border-purple-500/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-purple-400 text-2xl">science</span>
          <div className="flex-1">
            <p className="text-text-light font-semibold">{ideasEnPrueba} {ideasEnPrueba === 1 ? 'Idea' : 'Ideas'} Pendiente{ideasEnPrueba === 1 ? '' : 's'} de Pruebas</p>
            <p className="text-text-muted text-sm">Requieren pruebas de laboratorio y análisis</p>
          </div>
          <Link to="/ideas" className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600">
            Ver Ideas
          </Link>
        </div>
      )}

      {/* KPIs Principales - Diferentes según el rol */}
      {userRole && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {/* KPIs para Administrador y Supervisor QA */}
        {(userRole === 'ADMINISTRADOR' || userRole === 'SUPERVISOR_QA') && (
          <>
            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Lotes Pendientes</p>
                <span className="material-symbols-outlined text-warning text-xl">pending_actions</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">3</p>
              <p className="text-warning text-sm font-medium">Requieren atención inmediata</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">No Conformidades Activas</p>
                <span className="material-symbols-outlined text-danger text-xl">error</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">7</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-danger/20 text-danger px-2 py-1 rounded">2 Críticas</span>
                <span className="bg-warning/20 text-warning px-2 py-1 rounded">3 Mayores</span>
                <span className="bg-info/20 text-info px-2 py-1 rounded">2 Menores</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Órdenes en Producción</p>
                <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">12</p>
              <p className="text-success text-sm font-medium">+2 nuevas hoy</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Pruebas Pendientes</p>
                <span className="material-symbols-outlined text-info text-xl">biotech</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">18</p>
              <p className="text-text-muted text-sm">5 OOS en investigación</p>
            </div>
          </>
        )}

        {/* KPIs para Supervisor Calidad */}
        {userRole === 'SUPERVISOR_CALIDAD' && (
          <>
            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Materias Primas Recibidas</p>
                <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">24</p>
              <p className="text-success text-sm font-medium">+5 esta semana</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Análisis Pendientes</p>
                <span className="material-symbols-outlined text-warning text-xl">science</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">8</p>
              <p className="text-warning text-sm font-medium">Requieren revisión</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Lotes en Trazabilidad</p>
                <span className="material-symbols-outlined text-info text-xl">timeline</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">45</p>
              <p className="text-text-muted text-sm">Activos</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Devoluciones</p>
                <span className="material-symbols-outlined text-danger text-xl">assignment_return</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">2</p>
              <p className="text-danger text-sm font-medium">No aptas</p>
            </div>
          </>
        )}

        {/* KPIs para Analista de Laboratorio */}
        {userRole === 'ANALISTA_LABORATORIO' && (
          <>
            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Ideas en Prueba</p>
                <span className="material-symbols-outlined text-warning text-xl">science</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">{ideasEnPrueba}</p>
              <p className="text-warning text-sm font-medium">Requieren pruebas</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Pruebas Aprobadas</p>
                <span className="material-symbols-outlined text-success text-xl">check_circle</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">{ideasAprobadas}</p>
              <p className="text-success text-sm font-medium">Listas para producción</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Total Asignadas</p>
                <span className="material-symbols-outlined text-primary text-xl">assignment</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">{ideasAsignadas.length}</p>
              <p className="text-text-muted text-sm">Ideas asignadas</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between">
                <p className="text-text-muted text-sm font-medium">Completadas Hoy</p>
                <span className="material-symbols-outlined text-emerald-400 text-xl">today</span>
              </div>
              <p className="text-text-light text-3xl font-bold tracking-tight">{ideasCompletadasHoy}</p>
              <p className="text-emerald-400 text-sm font-medium">Finalizadas hoy</p>
            </div>
          </>
        )}
        </div>
      )}

      {/* Gráficos y Tablas - Solo para roles con visión completa (ocultar para analista) */}
      {(userRole === 'ADMINISTRADOR' || userRole === 'SUPERVISOR_QA') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Gráfico de Producción */}
          <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
            <p className="text-text-light text-base font-semibold">Producción por Línea (Últimos 7 días)</p>
            <div className="grid min-h-[240px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
              <div className="bg-primary/30 w-full rounded-t" style={{ height: '80%' }}></div>
              <p className="text-text-muted text-xs font-medium">Línea A</p>
              <div className="bg-primary/30 w-full rounded-t" style={{ height: '90%' }}></div>
              <p className="text-text-muted text-xs font-medium">Línea B</p>
              <div className="bg-primary/30 w-full rounded-t" style={{ height: '70%' }}></div>
              <p className="text-text-muted text-xs font-medium">Línea C</p>
              <div className="bg-primary w-full rounded-t" style={{ height: '100%' }}></div>
              <p className="text-text-muted text-xs font-medium">Línea D</p>
            </div>
          </div>

          {/* Estado de Equipos */}
          <div className="flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
            <p className="text-text-light text-base font-semibold">Estado de Equipos</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-success">check_circle</span>
                  <span className="text-text-light text-sm">Calibrados</span>
                </div>
                <span className="text-success font-bold">24</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-warning">schedule</span>
                  <span className="text-text-light text-sm">Vencen Pronto</span>
                </div>
                <span className="text-warning font-bold">3</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10 border border-danger/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-danger">cancel</span>
                  <span className="text-text-light text-sm">Vencidos</span>
                </div>
                <span className="text-danger font-bold">0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Análisis para Supervisor Calidad */}
      {userRole === 'SUPERVISOR_CALIDAD' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
            <p className="text-text-light text-base font-semibold">Materias Primas por Estado</p>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-success">check_circle</span>
                  <span className="text-text-light text-sm">Aptas</span>
                </div>
                <span className="text-success font-bold">18</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-warning">schedule</span>
                  <span className="text-text-light text-sm">En Análisis</span>
                </div>
                <span className="text-warning font-bold">8</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10 border border-danger/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-danger">cancel</span>
                  <span className="text-text-light text-sm">No Aptas</span>
                </div>
                <span className="text-danger font-bold">2</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
            <p className="text-text-light text-base font-semibold">Trazabilidad Activa</p>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">timeline</span>
                  <span className="text-text-light text-sm">Lotes Rastreables</span>
                </div>
                <span className="text-primary font-bold">45</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-info/10 border border-info/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-info">inventory_2</span>
                  <span className="text-text-light text-sm">Proveedores Activos</span>
                </div>
                <span className="text-info font-bold">12</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tablas de Información - Diferentes según el rol */}
      {userRole && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tablas para Administrador y Supervisor QA */}
        {(userRole === 'ADMINISTRADOR' || userRole === 'SUPERVISOR_QA') && (
          <>
            {/* Lotes Pendientes de Liberación */}
            <div className="rounded-lg bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <h2 className="text-text-light text-base font-semibold">Lotes Pendientes de Liberación</h2>
                <span className="bg-danger/20 text-danger px-2 py-1 rounded-full text-xs font-medium">3</span>
              </div>
              <div className="divide-y divide-border-dark">
                {[
                  { id: 'LOTE-2024-001', producto: 'Vitamina D3 2000UI', estado: 'Pendiente QA', fecha: '15/01/2024', tiempo: 'Hace 2 días' },
                  { id: 'LOTE-2024-002', producto: 'Omega-3 1000mg', estado: 'Pendiente QA', fecha: '16/01/2024', tiempo: 'Hace 1 día' },
                  { id: 'LOTE-2024-003', producto: 'Magnesio 400mg', estado: 'OOS Activo', fecha: '17/01/2024', tiempo: 'Hoy', isOOS: true }
                ].map((lote) => (
                  <div key={lote.id} className="grid grid-cols-3 gap-4 px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                    <div>
                      <p className="text-text-light font-medium">{lote.id}</p>
                      <p className="text-text-muted text-xs">{lote.producto}</p>
                    </div>
                    <div className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        lote.isOOS ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                      }`}>
                        {lote.estado}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-text-light font-medium">{lote.fecha}</p>
                      <p className="text-text-muted text-xs">{lote.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-border-dark">
                <Link to="/aprobacion" className="text-sm font-medium text-primary hover:underline">
                  Ver todos los lotes
                </Link>
              </div>
            </div>

            {/* No Conformidades Activas */}
            <div className="rounded-lg bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <h2 className="text-text-light text-base font-semibold">No Conformidades Activas</h2>
                <span className="bg-danger/20 text-danger px-2 py-1 rounded-full text-xs font-medium">7</span>
              </div>
              <div className="divide-y divide-border-dark">
                {[
                  { id: 'NC-2024-001', descripcion: 'Falta de validación de sistema computarizado', criticidad: 'Crítica', fecha: '10/01/2024' },
                  { id: 'NC-2024-002', descripcion: 'Liberación sin profesional idóneo', criticidad: 'Crítica', fecha: '12/01/2024' },
                  { id: 'NC-2024-003', descripcion: 'Trazabilidad incompleta de proceso', criticidad: 'Mayor', fecha: '14/01/2024' }
                ].map((nc) => (
                  <div key={nc.id} className="px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-text-light font-medium">{nc.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nc.criticidad === 'Crítica' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                      }`}>
                        {nc.criticidad}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs mb-2">{nc.descripcion}</p>
                    <p className="text-text-muted text-xs">Abierta: {nc.fecha}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-border-dark">
                <Link to="/aprobacion" className="text-sm font-medium text-primary hover:underline">
                  Ver todas las NC
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Tablas para Supervisor Calidad */}
        {userRole === 'SUPERVISOR_CALIDAD' && (
          <>
            {/* Materias Primas Recientes */}
            <div className="rounded-lg bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <h2 className="text-text-light text-base font-semibold">Materias Primas Recientes</h2>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">24</span>
              </div>
              <div className="divide-y divide-border-dark">
                {[
                  { id: 'MP-2024-001', nombre: 'Aceite de Pescado', proveedor: 'Proveedor A', estado: 'En Análisis', fecha: '20/01/2024' },
                  { id: 'MP-2024-002', nombre: 'Vitamina D3', proveedor: 'Proveedor B', estado: 'Apta', fecha: '19/01/2024' },
                  { id: 'MP-2024-003', nombre: 'Magnesio', proveedor: 'Proveedor C', estado: 'No Apta', fecha: '18/01/2024', isRejected: true }
                ].map((mp) => (
                  <div key={mp.id} className="px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-text-light font-medium">{mp.nombre}</p>
                        <p className="text-text-muted text-xs">{mp.proveedor}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mp.isRejected ? 'bg-danger/20 text-danger' : 
                        mp.estado === 'Apta' ? 'bg-success/20 text-success' : 
                        'bg-warning/20 text-warning'
                      }`}>
                        {mp.estado}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">Recibida: {mp.fecha}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-border-dark">
                <Link to="/inventario/materia-prima" className="text-sm font-medium text-primary hover:underline">
                  Ver todas las materias primas
                </Link>
              </div>
            </div>

            {/* Lotes en Trazabilidad */}
            {canViewTrace && (
              <div className="rounded-lg bg-card-dark border border-border-dark">
                <div className="flex items-center justify-between p-6 border-b border-border-dark">
                  <h2 className="text-text-light text-base font-semibold">Lotes en Trazabilidad</h2>
                  <span className="bg-info/20 text-info px-2 py-1 rounded-full text-xs font-medium">45</span>
                </div>
                <div className="divide-y divide-border-dark">
                  {[
                    { id: 'LOTE-2024-001', producto: 'Vitamina D3 2000UI', origen: 'MP-2024-002', fecha: '15/01/2024' },
                    { id: 'LOTE-2024-002', producto: 'Omega-3 1000mg', origen: 'MP-2024-001', fecha: '16/01/2024' },
                    { id: 'LOTE-2024-003', producto: 'Magnesio 400mg', origen: 'MP-2024-003', fecha: '17/01/2024' }
                  ].map((lote) => (
                    <div key={lote.id} className="px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                      <p className="text-text-light font-medium mb-1">{lote.id}</p>
                      <p className="text-text-muted text-xs mb-1">{lote.producto}</p>
                      <p className="text-text-muted text-xs">Origen: {lote.origen} | {lote.fecha}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-border-dark">
                  <Link to="/trazabilidad" className="text-sm font-medium text-primary hover:underline">
                    Ver trazabilidad completa
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tablas para Analista de Laboratorio */}
        {userRole === 'ANALISTA_LABORATORIO' && (
          <>
            {/* Ideas Asignadas para Pruebas */}
            <div className="rounded-lg bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <h2 className="text-text-light text-base font-semibold">Ideas Asignadas para Pruebas</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ideasEnPrueba > 0 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                }`}>
                  {ideasEnPrueba} {ideasEnPrueba === 1 ? 'pendiente' : 'pendientes'}
                </span>
              </div>
              {loadingIdeas ? (
                <div className="p-6 text-center">
                  <p className="text-text-muted text-sm">Cargando ideas...</p>
                </div>
              ) : ideasAsignadas.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="material-symbols-outlined text-4xl text-text-muted mb-2">assignment</span>
                  <p className="text-text-muted text-sm">No tienes ideas asignadas actualmente</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border-dark max-h-96 overflow-y-auto">
                    {ideasAsignadas.slice(0, 5).map((idea) => (
                      <div key={idea.id} className="px-6 py-4 text-sm hover:bg-border-dark/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-text-light font-medium mb-1">{idea.titulo}</p>
                            {idea.productoOrigenNombre && (
                              <p className="text-text-muted text-xs mb-1">
                                <span className="material-symbols-outlined text-xs align-middle mr-1">inventory_2</span>
                                Producto origen: {idea.productoOrigenNombre}
                              </p>
                            )}
                            {idea.objetivo && (
                              <p className="text-text-muted text-xs italic">"{idea.objetivo}"</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getEstadoColor(idea.estado)}`}>
                            {getEstadoLabel(idea.estado)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-text-muted text-xs">
                            Asignada: {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                          </p>
                          {idea.estado === 'EN_PRUEBA' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAprobarPrueba(idea.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleRechazarPrueba(idea.id)}
                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {ideasAsignadas.length > 5 && (
                    <div className="p-6 border-t border-border-dark">
                      <Link to="/ideas" className="text-sm font-medium text-primary hover:underline">
                        Ver todas las ideas ({ideasAsignadas.length})
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Información de Pruebas */}
            <div className="rounded-lg bg-card-dark border border-border-dark">
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <h2 className="text-text-light text-base font-semibold">Información de Pruebas</h2>
                <span className="material-symbols-outlined text-primary">biotech</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-text-light font-medium mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Proceso de Pruebas
                  </p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Revisa los detalles de cada idea asignada, realiza las pruebas de laboratorio según las especificaciones,
                    y registra los resultados. Una vez completadas las pruebas, puedes aprobar o rechazar la idea.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-light font-medium mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">science</span>
                    Módulo de Pruebas
                  </p>
                  <p className="text-text-muted text-xs mb-3">
                    Accede al módulo de Pruebas para crear pruebas específicas vinculadas a cada idea.
                  </p>
                  <Link to="/pruebas" className="text-sm font-medium text-primary hover:underline">
                    Ir a Pruebas →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      )}
=======
      {/* Alertas Críticas */}
      <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-danger text-2xl">warning</span>
        <div className="flex-1">
          <p className="text-text-light font-semibold">3 Lotes Pendientes de Liberación</p>
          <p className="text-text-muted text-sm">Requieren revisión y firma de profesional idóneo</p>
        </div>
        <Link to="/aprobacion" className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90">
          Revisar Ahora
        </Link>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-sm font-medium">Lotes Pendientes</p>
            <span className="material-symbols-outlined text-warning text-xl">pending_actions</span>
          </div>
          <p className="text-text-light text-3xl font-bold tracking-tight">3</p>
          <p className="text-warning text-sm font-medium">Requieren atención inmediata</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-sm font-medium">No Conformidades Activas</p>
            <span className="material-symbols-outlined text-danger text-xl">error</span>
          </div>
          <p className="text-text-light text-3xl font-bold tracking-tight">7</p>
          <div className="flex gap-2 text-xs">
            <span className="bg-danger/20 text-danger px-2 py-1 rounded">2 Críticas</span>
            <span className="bg-warning/20 text-warning px-2 py-1 rounded">3 Mayores</span>
            <span className="bg-info/20 text-info px-2 py-1 rounded">2 Menores</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-sm font-medium">Órdenes en Producción</p>
            <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
          </div>
          <p className="text-text-light text-3xl font-bold tracking-tight">12</p>
          <p className="text-success text-sm font-medium">+2 nuevas hoy</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-sm font-medium">Pruebas Pendientes</p>
            <span className="material-symbols-outlined text-info text-xl">biotech</span>
          </div>
          <p className="text-text-light text-3xl font-bold tracking-tight">18</p>
          <p className="text-text-muted text-sm">5 OOS en investigación</p>
        </div>
      </div>

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de Producción */}
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
          <p className="text-text-light text-base font-semibold">Producción por Línea (Últimos 7 días)</p>
          <div className="grid min-h-[240px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
            <div className="bg-primary/30 w-full rounded-t" style={{ height: '80%' }}></div>
            <p className="text-text-muted text-xs font-medium">Línea A</p>
            <div className="bg-primary/30 w-full rounded-t" style={{ height: '90%' }}></div>
            <p className="text-text-muted text-xs font-medium">Línea B</p>
            <div className="bg-primary/30 w-full rounded-t" style={{ height: '70%' }}></div>
            <p className="text-text-muted text-xs font-medium">Línea C</p>
            <div className="bg-primary w-full rounded-t" style={{ height: '100%' }}></div>
            <p className="text-text-muted text-xs font-medium">Línea D</p>
          </div>
        </div>

        {/* Estado de Equipos */}
        <div className="flex flex-col gap-4 rounded-lg p-6 bg-card-dark border border-border-dark">
          <p className="text-text-light text-base font-semibold">Estado de Equipos</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <span className="text-text-light text-sm">Calibrados</span>
              </div>
              <span className="text-success font-bold">24</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">schedule</span>
                <span className="text-text-light text-sm">Vencen Pronto</span>
              </div>
              <span className="text-warning font-bold">3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10 border border-danger/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-danger">cancel</span>
                <span className="text-text-light text-sm">Vencidos</span>
              </div>
              <span className="text-danger font-bold">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lotes Pendientes de Liberación */}
        <div className="rounded-lg bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between p-6 border-b border-border-dark">
            <h2 className="text-text-light text-base font-semibold">Lotes Pendientes de Liberación</h2>
            <span className="bg-danger/20 text-danger px-2 py-1 rounded-full text-xs font-medium">3</span>
          </div>
          <div className="divide-y divide-border-dark">
            {[
              { id: 'LOTE-2024-001', producto: 'Vitamina D3 2000UI', estado: 'Pendiente QA', fecha: '15/01/2024', tiempo: 'Hace 2 días' },
              { id: 'LOTE-2024-002', producto: 'Omega-3 1000mg', estado: 'Pendiente QA', fecha: '16/01/2024', tiempo: 'Hace 1 día' },
              { id: 'LOTE-2024-003', producto: 'Magnesio 400mg', estado: 'OOS Activo', fecha: '17/01/2024', tiempo: 'Hoy', isOOS: true }
            ].map((lote) => (
              <div key={lote.id} className="grid grid-cols-3 gap-4 px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                <div>
                  <p className="text-text-light font-medium">{lote.id}</p>
                  <p className="text-text-muted text-xs">{lote.producto}</p>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    lote.isOOS ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  }`}>
                    {lote.estado}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-text-light font-medium">{lote.fecha}</p>
                  <p className="text-text-muted text-xs">{lote.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-border-dark">
            <Link to="/aprobacion" className="text-sm font-medium text-primary hover:underline">
              Ver todos los lotes
            </Link>
          </div>
        </div>

        {/* No Conformidades Activas */}
        <div className="rounded-lg bg-card-dark border border-border-dark">
          <div className="flex items-center justify-between p-6 border-b border-border-dark">
            <h2 className="text-text-light text-base font-semibold">No Conformidades Activas</h2>
            <span className="bg-danger/20 text-danger px-2 py-1 rounded-full text-xs font-medium">7</span>
          </div>
          <div className="divide-y divide-border-dark">
            {[
              { id: 'NC-2024-001', descripcion: 'Falta de validación de sistema computarizado', criticidad: 'Crítica', fecha: '10/01/2024' },
              { id: 'NC-2024-002', descripcion: 'Liberación sin profesional idóneo', criticidad: 'Crítica', fecha: '12/01/2024' },
              { id: 'NC-2024-003', descripcion: 'Trazabilidad incompleta de proceso', criticidad: 'Mayor', fecha: '14/01/2024' }
            ].map((nc) => (
              <div key={nc.id} className="px-6 py-4 text-sm hover:bg-border-dark/50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-text-light font-medium">{nc.id}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nc.criticidad === 'Crítica' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  }`}>
                    {nc.criticidad}
                  </span>
                </div>
                <p className="text-text-muted text-xs mb-2">{nc.descripcion}</p>
                <p className="text-text-muted text-xs">Abierta: {nc.fecha}</p>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-border-dark">
            <Link to="/aprobacion" className="text-sm font-medium text-primary hover:underline">
              Ver todas las NC
            </Link>
          </div>
        </div>
      </div>
>>>>>>> origin/main
    </div>
  )
}

export default Dashboard

