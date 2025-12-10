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
  const [showDetalleModal, setShowDetalleModal] = useState(false)

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
    setShowDetalleModal(true)
    try {
      const detalle = await produccionService.getOrdenDetalle(orden.id)
      setOrdenDetalle(detalle)
    } catch (err) {
      setError(err.message || 'Error al cargar detalles de la orden')
      console.error('Error al cargar detalle:', err)
      setShowDetalleModal(false)
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">CÓDIGO</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">TÍTULO</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">CANTIDAD</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">ESTADO</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className={`border-b border-border-dark hover:bg-card-dark/30 transition-colors cursor-pointer ${
                      selectedOrden?.id === orden.id ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleSelectOrden(orden)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-text-light font-medium text-sm">{orden.codigo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-light text-sm line-clamp-1">{orden.ideaTitulo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-light text-sm">{orden.cantidad} unidades</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        orden.estado === 'EN_PROCESO' ? 'bg-amber-500/20 text-amber-400' : 
                        orden.estado === 'EN_PRODUCCION' ? 'bg-primary/20 text-primary' : 
                        'bg-success/20 text-success'
                      }`}>
                        {orden.estado === 'EN_PROCESO' ? 'En Proceso' : 
                         orden.estado === 'EN_PRODUCCION' ? 'En Producción' : orden.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectOrden(orden)
                        }}
                        className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center"
                        title="Ver Detalles"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetalleModal && ordenDetalle && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetalleModal(false)
              setSelectedOrden(null)
              setOrdenDetalle(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-8">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-text-light text-2xl font-bold">{ordenDetalle.ideaTitulo}</h2>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    ordenDetalle.estado === 'EN_PROCESO' ? 'bg-amber-500/20 text-amber-400' : 
                    ordenDetalle.estado === 'EN_PRODUCCION' ? 'bg-primary/20 text-primary' : 
                    'bg-success/20 text-success'
                  }`}>
                    {ordenDetalle.estado === 'EN_PROCESO' ? 'En Proceso' : 
                     ordenDetalle.estado === 'EN_PRODUCCION' ? 'En Producción' : ordenDetalle.estado}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowDetalleModal(false)
                    setSelectedOrden(null)
                    setOrdenDetalle(null)
                  }}
                  className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {ordenDetalle.ideaDescripcion && (
                <div>
                  <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                    {ordenDetalle.ideaDescripcion.replace(/\\n/g, '\n')}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-text-light font-semibold text-lg mb-3">Información General</h3>
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark space-y-3">
                  {ordenDetalle.ideaObjetivo && (
                    <div>
                      <p className="text-text-muted text-xs mb-1">Objetivo:</p>
                      <p className="text-text-light text-sm font-medium">{ordenDetalle.ideaObjetivo}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted text-xs">Categoría:</span>
                      <p className="text-text-light font-medium">{ordenDetalle.ideaCategoria || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Creado por:</span>
                      <p className="text-text-light font-medium">{ordenDetalle.ideaCreatedByName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Fecha:</span>
                      <p className="text-text-light font-medium">
                        {ordenDetalle.ideaCreatedAt ? new Date(ordenDetalle.ideaCreatedAt).toLocaleDateString('es-ES') : 'N/A'}
                      </p>
                    </div>
                    {ordenDetalle.ideaAsignadoANombre && (
                      <div>
                        <span className="text-text-muted text-xs">Asignado a:</span>
                        <p className="text-text-light font-medium">{ordenDetalle.ideaAsignadoANombre}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-text-light font-semibold text-lg mb-3">Ingredientes</h3>
                {ordenDetalle.materiales && ordenDetalle.materiales.length > 0 ? (
                  <div className="space-y-2">
                    {ordenDetalle.materiales.map((material, index) => (
                      <div key={index} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-text-light font-medium text-base mb-1">{material.materialNombre}</p>
                            {material.funcion && (
                              <p className="text-text-muted text-xs mb-2">{material.funcion}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-text-light font-semibold text-sm mb-1">
                              {material.cantidadRequerida} {material.unidadRequerida}
                            </p>
                            {material.porcentaje && (
                              <p className="text-primary font-medium text-sm">
                                {material.porcentaje}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">No hay ingredientes definidos</p>
                )}
              </div>

              {!ordenDetalle.loteId && (
                <button
                  onClick={async () => {
                    if (!window.confirm('¿Está seguro de que desea iniciar la producción? Se generará un lote automáticamente.')) {
                      return
                    }
                    setGenerandoLote(true)
                    setError('')
                    try {
                      await produccionService.generarLote(selectedOrden.id)
                      alert('Lote generado exitosamente. Puede verlo en la página de Trazabilidad de Lote.')
                      setShowDetalleModal(false)
                      setSelectedOrden(null)
                      setOrdenDetalle(null)
                      loadOrdenes()
                    } catch (err) {
                      setError(err.message || 'Error al generar lote')
                      console.error('Error al generar lote:', err)
                    } finally {
                      setGenerandoLote(false)
                    }
                  }}
                  disabled={generandoLote}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          </div>
        </div>
      )}
    </div>
  )
}

export default Produccion
