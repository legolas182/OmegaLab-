import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import dashboardService from '../services/dashboardService'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Solo ADMIN puede ver el dashboard.
  // Para el resto de roles, redirigimos a su vista principal.
  useEffect(() => {
    if (!isAdmin) {
      if (isAnalistaLab) {
        navigate('/pruebas', { replace: true })
      } else if (isSupervisorQA) {
        navigate('/aprobacion', { replace: true })
      } else if (isSupervisorCalidad) {
        navigate('/produccion', { replace: true })
      } else {
        navigate('/historial', { replace: true })
      }
    }
  }, [isAdmin, isAnalistaLab, isSupervisorQA, isSupervisorCalidad, navigate])

  const userRole = isAdmin ? 'ADMINISTRADOR' : null

  const getDashboardTitle = () => {
    return 'Dashboard Administrativo'
  }

  const getDashboardDescription = () => {
    return 'Vista completa del sistema y gestión administrativa'
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await dashboardService.getDashboardData(userRole)
        setData(result)
      } catch (err) {
        setData({
          ideas: { total: 0, porEstado: {}, list: [] },
          pruebas: { total: 0, porEstado: {}, list: [] },
          productos: { total: 0 },
          materiales: { total: 0 },
          formulas: { total: 0, porEstado: {} },
          ordenes: { total: 0, enProceso: 0, completadas: 0, list: [] }
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userRole])

  if (!userRole) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-light text-lg font-semibold mb-2">Error al cargar el dashboard</p>
          <p className="text-text-muted text-sm">No se pudo determinar el rol del usuario.</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon, label, value, color, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-card-dark border border-border-dark p-5 text-left hover:border-primary/50 transition-colors w-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm font-medium">{label}</p>
          <p className="text-text-light text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
      </div>
    </button>
  )

  const formatEstado = (estado) => {
    if (!estado) return '-'
    const e = estado.toLowerCase()
    if (e === 'oos') return 'OOS (En Investigación)'
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">{getDashboardTitle()}</h1>
          <p className="text-text-muted text-sm mt-1">{getDashboardDescription()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon="lightbulb_outline"
              label="Ideas"
              value={data?.ideas?.total ?? 0}
              color="text-amber-400"
              onClick={() => navigate('/ideas')}
            />
            <StatCard
              icon="science"
              label="Pruebas"
              value={data?.pruebas?.total ?? 0}
              color="text-info"
              onClick={() => navigate('/pruebas')}
            />
            <StatCard
              icon="inventory_2"
              label="Productos"
              value={data?.productos?.total ?? 0}
              color="text-primary"
              onClick={() => navigate('/inventario/productos')}
            />
            <StatCard
              icon="biotech"
              label="Materias Primas"
              value={data?.materiales?.total ?? 0}
              color="text-success"
              onClick={() => navigate('/inventario/materia-prima')}
            />
            <StatCard
              icon="description"
              label="Fórmulas"
              value={data?.formulas?.total ?? 0}
              color="text-purple-400"
              onClick={() => navigate('/ideas')}
            />
            <StatCard
              icon="factory"
              label="Órdenes"
              value={data?.ordenes?.total ?? 0}
              color="text-warning"
              onClick={() => navigate('/produccion')}
            />
          </div>

          {/* Resumen por estado y actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ideas por estado */}
            <div className="rounded-lg bg-card-dark border border-border-dark p-6">
              <h2 className="text-text-light font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-xl">lightbulb_outline</span>
                Ideas por estado
              </h2>
              {data?.ideas?.total > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.ideas.porEstado || {}).map(([estado, count]) => (
                    <div key={estado} className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">{formatEstado(estado)}</span>
                      <span className="text-text-light font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">Sin ideas registradas</p>
              )}
            </div>

            {/* Pruebas por estado */}
            <div className="rounded-lg bg-card-dark border border-border-dark p-6">
              <h2 className="text-text-light font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-info text-xl">science</span>
                Pruebas por estado
              </h2>
              {data?.pruebas?.total > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.pruebas.porEstado || {}).map(([estado, count]) => (
                    <div key={estado} className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">{formatEstado(estado)}</span>
                      <span className="text-text-light font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">Sin pruebas registradas</p>
              )}
            </div>
          </div>

          {/* Órdenes en proceso */}
          {data?.ordenes?.enProceso > 0 && (
            <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
              <h2 className="text-text-light font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-warning text-xl">schedule</span>
                Órdenes en proceso
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-warning">{data.ordenes.enProceso}</p>
                  <p className="text-text-muted text-sm">Requieren atención</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/produccion')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                >
                  Ver producción
                </button>
              </div>
            </div>
          )}

          {/* Actividad reciente - Ideas */}
          {data?.ideas?.list?.length > 0 && (
            <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
              <h2 className="text-text-light font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-xl">history</span>
                Ideas recientes
              </h2>
              <div className="space-y-3">
                {data.ideas.list.map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => navigate('/ideas')}
                    className="w-full text-left p-3 rounded-lg bg-input-dark/50 hover:bg-input-dark border border-transparent hover:border-border-dark transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-text-light font-medium text-sm truncate flex-1">{idea.titulo}</p>
                      <span className="text-text-muted text-xs ml-2 shrink-0">
                        {(idea.createdAt || idea.created_at) ? new Date(idea.createdAt || idea.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs mt-1">{formatEstado(idea.estado)}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/ideas')}
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                Ver todas las ideas →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
