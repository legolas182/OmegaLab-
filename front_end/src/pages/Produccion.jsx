import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import produccionService from '../services/produccionService'

const Produccion = () => {
  const { user } = useAuth()

  if (!user || (!hasAnyRole(user, 'SUPERVISOR_CALIDAD') && !hasAnyRole(user, 'ADMINISTRADOR'))) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">Solo Supervisor de Calidad y Administrador pueden acceder a Producción / Proceso</p>
        </div>
      </div>
    )
  }

  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [ordenDetalle, setOrdenDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [generandoLote, setGenerandoLote] = useState(false)

  useEffect(() => {
    loadOrdenes()
  }, [])

  const loadOrdenes = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await produccionService.getOrdenesProduccion()
      setOrdenes(data)
    } catch (err) {
      setError(err.message || 'Error al cargar órdenes de producción')
      console.error('Error al cargar órdenes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrden = async (orden) => {
    setSelectedOrden(orden)
    setLoadingDetalle(true)
    setError('')
    try {
      const detalle = await produccionService.getOrdenDetalle(orden.id)
      setOrdenDetalle(detalle)
    } catch (err) {
      setError(err.message || 'Error al cargar detalles de la orden')
      console.error('Error al cargar detalle:', err)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleGenerarLote = async () => {
    if (!selectedOrden) return
    
    if (!window.confirm('¿Está seguro de que desea iniciar la producción? Se generará un lote automáticamente.')) {
      return
    }
    
    setGenerandoLote(true)
    setError('')
    try {
      await produccionService.generarLote(selectedOrden.id)
      alert('Lote generado exitosamente. Puede verlo en la página de Trazabilidad de Lote.')
      setSelectedOrden(null)
      setOrdenDetalle(null)
      loadOrdenes()
    } catch (err) {
      setError(err.message || 'Error al generar lote')
      console.error('Error al generar lote:', err)
    } finally {
      setGenerandoLote(false)
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Producción / Proceso</h1>
          <p className="text-text-muted text-sm mt-1">Órdenes de Producción</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-card-dark border border-border-dark">
          <div className="p-4 border-b border-border-dark">
            <h2 className="text-text-light font-semibold">Órdenes de Producción ({ordenes.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-text-muted">Cargando órdenes...</div>
          ) : ordenes.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
              <p className="text-sm">No hay órdenes de producción asignadas</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {ordenes.map((orden) => (
                <div
                  key={orden.id}
                  className={`p-4 hover:bg-border-dark/50 cursor-pointer transition-colors ${
                    selectedOrden?.id === orden.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                  }`}
                  onClick={() => handleSelectOrden(orden)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-text-light font-medium">{orden.codigo}</p>
                      <p className="text-text-muted text-sm">{orden.ideaTitulo}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Cantidad</p>
                      <p className="text-text-light">{orden.cantidad} unidades</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Estado</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        orden.estado === 'EN_PROCESO' ? 'bg-warning/20 text-warning' : 
                        orden.estado === 'EN_PRODUCCION' ? 'bg-primary/20 text-primary' : 
                        'bg-success/20 text-success'
                      }`}>
                        {orden.estado === 'EN_PROCESO' ? 'En Proceso' : 
                         orden.estado === 'EN_PRODUCCION' ? 'En Producción' : orden.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-card-dark border border-border-dark">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <h2 className="text-text-light font-semibold">Detalles de la Orden</h2>
            {selectedOrden && (
              <button
                onClick={() => {
                  setSelectedOrden(null)
                  setOrdenDetalle(null)
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
          
          {!selectedOrden ? (
            <div className="p-8 text-center text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 block">info</span>
              <p className="text-sm">Seleccione una orden para ver los detalles</p>
            </div>
          ) : loadingDetalle ? (
            <div className="p-8 text-center text-text-muted">Cargando detalles...</div>
          ) : ordenDetalle ? (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-text-light font-semibold mb-2">{ordenDetalle.codigo}</h3>
                <p className="text-text-muted text-sm">{ordenDetalle.ideaTitulo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-muted text-sm mb-1">Cantidad Requerida</p>
                  <p className="text-text-light font-semibold">{ordenDetalle.cantidad} unidades</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm mb-1">Supervisor</p>
                  <p className="text-text-light">{ordenDetalle.supervisorCalidadNombre || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-text-light font-semibold mb-3">Materiales Necesarios</h4>
                {ordenDetalle.materiales && ordenDetalle.materiales.length > 0 ? (
                  <div className="space-y-2">
                    {ordenDetalle.materiales.map((material, index) => (
                      <div key={index} className="p-3 rounded-lg bg-input-dark border border-border-dark">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-text-light font-medium">{material.materialNombre}</p>
                            {material.materialCodigo && (
                              <p className="text-text-muted text-xs">Código: {material.materialCodigo}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-text-light font-semibold">
                              {material.cantidadRequerida} {material.unidadRequerida}
                            </p>
                            {material.porcentaje && (
                              <p className="text-text-muted text-xs">
                                {material.porcentaje}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">No hay materiales definidos</p>
                )}
              </div>

              {!ordenDetalle.loteId && (
                <button
                  onClick={handleGenerarLote}
                  disabled={generandoLote}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generandoLote ? 'Generando Lote...' : 'Producir'}
                </button>
              )}

              {ordenDetalle.loteId && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <p className="text-success text-sm font-medium">
                    <span className="material-symbols-outlined align-middle">check_circle</span>
                    Lote generado: {ordenDetalle.loteCodigo}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted">
              <p className="text-sm">Error al cargar los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Produccion
