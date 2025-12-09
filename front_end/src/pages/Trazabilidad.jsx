import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import loteService from '../services/loteService'

const Trazabilidad = () => {
  const { user } = useAuth()

  if (!user || (!hasAnyRole(user, 'SUPERVISOR_CALIDAD') && !hasAnyRole(user, 'ADMINISTRADOR'))) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">Solo Supervisor de Calidad y Administrador pueden acceder a Trazabilidad Lote</p>
        </div>
      </div>
    )
  }

  const [loteId, setLoteId] = useState('')
  const [lotes, setLotes] = useState([])
  const [trazabilidad, setTrazabilidad] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingLote, setLoadingLote] = useState(false)

  useEffect(() => {
    loadLotes()
  }, [])

  const loadLotes = async () => {
    setLoading(true)
    try {
      const data = await loteService.getAllLotes()
      setLotes(data)
    } catch (error) {
      console.error('Error al cargar lotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscarLote = async () => {
    if (!loteId.trim()) {
      alert('Por favor ingrese un código de lote')
      return
    }
    
    setLoadingLote(true)
    try {
      const lote = await loteService.getLoteByCodigo(loteId.trim())
      setTrazabilidad(lote)
    } catch (error) {
      alert('Lote no encontrado: ' + (error.message || 'Error desconocido'))
      setTrazabilidad(null)
    } finally {
      setLoadingLote(false)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Origen':
        return 'bg-primary'
      case 'Proceso':
        return 'bg-warning'
      case 'Calidad':
        return 'bg-info'
      case 'Distribución':
        return 'bg-success'
      default:
        return 'bg-text-muted'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Origen':
        return 'inventory'
      case 'Proceso':
        return 'precision_manufacturing'
      case 'Calidad':
        return 'biotech'
      case 'Distribución':
        return 'local_shipping'
      default:
        return 'event'
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Trazabilidad de Lote</h1>
          <p className="text-text-muted text-sm mt-1">Vista detallada de la línea de tiempo completa del lote</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscarLote()}
            placeholder="Buscar lote..."
            className="h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
          <button 
            onClick={handleBuscarLote}
            disabled={loadingLote}
            className="h-10 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loadingLote ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-muted">Cargando lotes...</div>
      ) : lotes.length > 0 && (
        <div className="mb-6 rounded-lg bg-card-dark border border-border-dark p-4">
          <p className="text-text-muted text-sm mb-2">Lotes disponibles:</p>
          <div className="flex flex-wrap gap-2">
            {lotes.map((lote) => (
              <button
                key={lote.id}
                onClick={() => {
                  setLoteId(lote.codigo)
                  handleBuscarLote()
                }}
                className="px-3 py-1 rounded bg-input-dark text-text-light text-sm hover:bg-border-dark"
              >
                {lote.codigo}
              </button>
            ))}
          </div>
        </div>
      )}

      {trazabilidad && (
        <>
          <div className="rounded-lg bg-card-dark border border-border-dark p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-text-muted text-sm mb-1">ID del Lote</p>
                <p className="text-text-light font-semibold text-lg">{trazabilidad.codigo}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Producto</p>
                <p className="text-text-light font-semibold">{trazabilidad.productoNombre || 'N/A'}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Fecha de Producción</p>
                <p className="text-text-light font-semibold">{formatFecha(trazabilidad.fechaProduccion)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card-dark border border-border-dark p-6">
            <h2 className="text-text-light text-xl font-semibold mb-6">Línea de Tiempo Completa</h2>
            
            {trazabilidad.eventos && trazabilidad.eventos.length > 0 ? (
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border-dark"></div>

                <div className="space-y-8">
                  {trazabilidad.eventos.map((evento, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${getTipoColor(evento.tipo)}`}>
                        <span className="material-symbols-outlined text-white">
                          {getTipoIcon(evento.tipo)}
                        </span>
                      </div>

                      <div className="flex-1 pb-8">
                        <div className="rounded-lg bg-input-dark border border-border-dark p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  evento.tipo === 'Origen' ? 'bg-primary/20 text-primary' :
                                  evento.tipo === 'Proceso' ? 'bg-warning/20 text-warning' :
                                  evento.tipo === 'Calidad' ? 'bg-info/20 text-info' :
                                  'bg-success/20 text-success'
                                }`}>
                                  {evento.tipo}
                                </span>
                                {evento.identificador && (
                                  <span className="text-text-muted text-xs">{evento.identificador}</span>
                                )}
                              </div>
                              <h3 className="text-text-light font-semibold">{evento.descripcion}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-text-light text-sm font-medium">{formatFecha(evento.fecha)}</p>
                              {evento.hora && (
                                <p className="text-text-muted text-xs">{evento.hora}</p>
                              )}
                            </div>
                          </div>

                          {evento.detalles && (
                            <div className="mt-3 p-2 rounded bg-card-dark text-sm">
                              <p className="text-text-light">{evento.detalles}</p>
                            </div>
                          )}

                          {evento.usuarioNombre && (
                            <div className="mt-3 pt-3 border-t border-border-dark">
                              <p className="text-text-muted text-xs">
                                <span className="material-symbols-outlined align-middle text-base">person</span>
                                Registrado por: {evento.usuarioNombre}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-text-muted">
                <p>No hay eventos registrados para este lote</p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
            <h2 className="text-text-light text-xl font-semibold mb-4">Resumen de Trazabilidad</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-input-dark">
                <p className="text-text-muted text-xs mb-1">Total de Eventos</p>
                <p className="text-text-light font-semibold">{trazabilidad.eventos?.length || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-input-dark">
                <p className="text-text-muted text-xs mb-1">Estado</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  trazabilidad.estado === 'EN_PROCESO' ? 'bg-warning/20 text-warning' :
                  trazabilidad.estado === 'COMPLETADO' ? 'bg-success/20 text-success' :
                  'bg-primary/20 text-primary'
                }`}>
                  {trazabilidad.estado || 'N/A'}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-input-dark">
                <p className="text-text-muted text-xs mb-1">Orden de Producción</p>
                <p className="text-text-light font-semibold">{trazabilidad.ordenCodigo || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-input-dark">
                <p className="text-text-muted text-xs mb-1">Fecha de Creación</p>
                <p className="text-text-light font-semibold">{formatFecha(trazabilidad.createdAt)}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!trazabilidad && !loadingLote && (
        <div className="rounded-lg bg-card-dark border border-border-dark p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-text-muted mb-2 block">search</span>
          <p className="text-text-muted">Busque un lote para ver su trazabilidad</p>
        </div>
      )}
    </div>
  )
}

export default Trazabilidad
