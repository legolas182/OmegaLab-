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

  useEffect(() => {
    if (!isAdmin) {
      if (isAnalistaLab) navigate('/pruebas', { replace: true })
      else if (isSupervisorQA) navigate('/aprobacion', { replace: true })
      else if (isSupervisorCalidad) navigate('/produccion', { replace: true })
      else navigate('/historial', { replace: true })
    }
  }, [isAdmin, isAnalistaLab, isSupervisorQA, isSupervisorCalidad, navigate])

  const userRole = isAdmin ? 'ADMINISTRADOR' : null

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await dashboardService.getDashboardData(userRole)
        setData(result)
      } catch {
        setData({
          ideas:     { total: 0, porEstado: {}, list: [] },
          pruebas:   { total: 0, porEstado: {}, list: [] },
          productos:  { total: 0 },
          materiales: { total: 0 },
          formulas:   { total: 0, porEstado: {} },
          ordenes:    { total: 0, enProceso: 0, completadas: 0, list: [] }
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
        <p className="text-text-muted text-sm">No se pudo determinar el rol del usuario.</p>
      </div>
    )
  }

  const formatEstado = (estado) => {
    if (!estado) return '-'
    if (estado.toLowerCase() === 'oos') return 'OOS (En Investigación)'
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /* ── Sub-components ────────────────────────────────────────────────── */

  const StatCard = ({ icon, label, value, color, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl bg-card-dark border border-border-dark px-4 py-3 text-left hover:border-primary/40 hover:bg-white/5 transition-all duration-200 w-full"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wider truncate">{label}</p>
          <p className="text-text-light text-2xl font-bold leading-tight mt-0.5">{value ?? 0}</p>
        </div>
        <span className={`material-symbols-outlined text-2xl ${color} group-hover:scale-110 transition-transform shrink-0`}>{icon}</span>
      </div>
    </button>
  )

  /* ── Layout ────────────────────────────────────────────────────────── */
  return (
    <div className="w-full h-full flex flex-col overflow-hidden gap-4">

      {/* HEADER — compact */}
      <div className="shrink-0">
        <h1 className="text-text-light text-2xl font-bold tracking-tight leading-tight">Dashboard Administrativo</h1>
        <p className="text-text-muted text-xs mt-0.5">Vista completa del sistema y gestión administrativa</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* KPI row — does not grow */}
          <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard icon="lightbulb_outline" label="Ideas"          value={data?.ideas?.total}      color="text-amber-400"  onClick={() => navigate('/ideas')} />
            <StatCard icon="science"           label="Pruebas"        value={data?.pruebas?.total}    color="text-info"       onClick={() => navigate('/pruebas')} />
            <StatCard icon="inventory_2"       label="Productos"      value={data?.productos?.total}  color="text-primary"    onClick={() => navigate('/inventario/productos')} />
            <StatCard icon="biotech"           label="Materias Primas" value={data?.materiales?.total} color="text-success"  onClick={() => navigate('/inventario/materia-prima')} />
            <StatCard icon="description"       label="Fórmulas"       value={data?.formulas?.total}   color="text-purple-400" onClick={() => navigate('/ideas')} />
            <StatCard icon="factory"           label="Órdenes"        value={data?.ordenes?.total}    color="text-warning"    onClick={() => navigate('/produccion')} />
          </div>

          {/* MAIN PANELS — fills all remaining vertical space */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Ideas por estado */}
            <div className="rounded-xl bg-card-dark border border-border-dark flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark bg-white/5 shrink-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">lightbulb_outline</span>
                <h2 className="text-text-light font-semibold text-sm">Ideas por estado</h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4">
                {data?.ideas?.total > 0 ? (
                  <div className="space-y-2.5">
                    {Object.entries(data.ideas.porEstado || {}).map(([estado, count]) => (
                      <div key={estado} className="flex justify-between items-center">
                        <span className="text-text-muted text-sm">{formatEstado(estado)}</span>
                        <span className="text-text-light font-semibold text-sm bg-white/5 px-2.5 py-0.5 rounded border border-white/10">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-text-muted/20">lightbulb_outline</span>
                    <p className="text-text-muted text-sm">Sin ideas registradas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pruebas por estado */}
            <div className="rounded-xl bg-card-dark border border-border-dark flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark bg-white/5 shrink-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-info text-lg">science</span>
                <h2 className="text-text-light font-semibold text-sm">Pruebas por estado</h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4">
                {data?.pruebas?.total > 0 ? (
                  <div className="space-y-2.5">
                    {Object.entries(data.pruebas.porEstado || {}).map(([estado, count]) => (
                      <div key={estado} className="flex justify-between items-center">
                        <span className="text-text-muted text-sm">{formatEstado(estado)}</span>
                        <span className="text-text-light font-semibold text-sm bg-white/5 px-2.5 py-0.5 rounded border border-white/10">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-text-muted/20">science</span>
                    <p className="text-text-muted text-sm">Sin pruebas registradas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ideas recientes + Órdenes en proceso */}
            <div className="rounded-xl bg-card-dark border border-border-dark flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark bg-white/5 shrink-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">history</span>
                <h2 className="text-text-light font-semibold text-sm">Ideas recientes</h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4">
                {data?.ideas?.list?.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {data.ideas.list.map((idea) => (
                        <button
                          key={idea.id}
                          type="button"
                          onClick={() => navigate('/ideas')}
                          className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-text-light font-medium text-xs truncate flex-1 group-hover:text-primary transition-colors">
                              {idea.titulo}
                            </p>
                            <span className="text-text-muted text-[10px] shrink-0">
                              {(idea.createdAt || idea.created_at)
                                ? new Date(idea.createdAt || idea.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                : '-'}
                            </span>
                          </div>
                          <p className="text-text-muted text-[10px] mt-0.5">{formatEstado(idea.estado)}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/ideas')}
                      className="mt-3 text-primary text-xs font-medium hover:underline"
                    >
                      Ver todas las ideas →
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-text-muted/20">history</span>
                    <p className="text-text-muted text-sm">Sin actividad reciente</p>
                  </div>
                )}
              </div>

              {/* Órdenes en proceso — footer del panel */}
              {data?.ordenes?.enProceso > 0 && (
                <div className="px-4 py-3 border-t border-border-dark bg-white/5 shrink-0 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Órdenes en proceso</p>
                    <p className="text-warning font-bold text-lg leading-tight">{data.ordenes.enProceso}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/produccion')}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs font-medium transition-colors shrink-0"
                  >
                    Ver producción
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
