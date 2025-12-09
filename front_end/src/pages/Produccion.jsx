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
  const [showDispensacion, setShowDispensacion] = useState(false)
  const [showLineClearance, setShowLineClearance] = useState(false)
  const [dispensacionData, setDispensacionData] = useState(null)
  const [lineClearanceData, setLineClearanceData] = useState(null)
  const [loadingDispensacion, setLoadingDispensacion] = useState(false)
  const [loadingLineClearance, setLoadingLineClearance] = useState(false)
  const [savingDispensacion, setSavingDispensacion] = useState(false)
  const [savingLineClearance, setSavingLineClearance] = useState(false)

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

  const handleOpenDispensacion = async (orden) => {
    setSelectedOrden(orden)
    setShowDispensacion(true)
    setLoadingDispensacion(true)
    try {
      const data = await produccionService.getDispensacionByOrdenId(orden.id)
      setDispensacionData(data)
    } catch (err) {
      setError(err.message || 'Error al cargar datos de dispensación')
      console.error('Error al cargar dispensación:', err)
    } finally {
      setLoadingDispensacion(false)
    }
  }

  const handleOpenLineClearance = async (orden) => {
    setSelectedOrden(orden)
    setShowLineClearance(true)
    setLoadingLineClearance(true)
    try {
      const data = await produccionService.getLineClearanceByOrdenId(orden.id)
      setLineClearanceData(data)
    } catch (err) {
      setError(err.message || 'Error al cargar datos de despeje de línea')
      console.error('Error al cargar line clearance:', err)
    } finally {
      setLoadingLineClearance(false)
    }
  }

  const handleUpdateDispensacionItem = (index, cantidadPesada) => {
    if (!dispensacionData || !dispensacionData.items) return
    
    const updatedItems = [...dispensacionData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      cantidadPesada: parseFloat(cantidadPesada) || 0
    }
    setDispensacionData({
      ...dispensacionData,
      items: updatedItems
    })
  }

  const handleUpdateLineClearanceCheck = (field, value) => {
    setLineClearanceData({
      ...lineClearanceData,
      [field]: value
    })
  }

  const handleSaveDispensacion = async () => {
    if (!selectedOrden || !dispensacionData) return
    
    setSavingDispensacion(true)
    try {
      await produccionService.saveDispensacion(selectedOrden.id, {
        ...dispensacionData,
        equipoUtilizado: dispensacionData.equipoUtilizado || 'BAL-001',
        fechaCalibracion: dispensacionData.fechaCalibracion || new Date().toISOString()
      })
      setShowDispensacion(false)
      setDispensacionData(null)
      loadOrdenes()
    } catch (err) {
      setError(err.message || 'Error al guardar dispensación')
      console.error('Error al guardar dispensación:', err)
    } finally {
      setSavingDispensacion(false)
    }
  }

  const handleSaveLineClearance = async () => {
    if (!selectedOrden || !lineClearanceData) return
    
    const allChecked = lineClearanceData.lineaLimpia && 
                       lineClearanceData.sinResiduos && 
                       lineClearanceData.equiposVerificados && 
                       lineClearanceData.documentacionCompleta && 
                       lineClearanceData.materialesCorrectos
    
    if (!allChecked) {
      alert('Debe completar todos los items del checklist')
      return
    }
    
    setSavingLineClearance(true)
    try {
      await produccionService.saveLineClearance(selectedOrden.id, {
        ...lineClearanceData,
        completado: true
      })
      setShowLineClearance(false)
      setLineClearanceData(null)
      loadOrdenes()
    } catch (err) {
      setError(err.message || 'Error al guardar despeje de línea')
      console.error('Error al guardar line clearance:', err)
    } finally {
      setSavingLineClearance(false)
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Producción / Proceso</h1>
          <p className="text-text-muted text-sm mt-1">Órdenes de Lote, Dispensación y Despeje de Línea</p>
        </div>
        <button className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
          Nueva Orden
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
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
              className="p-4 hover:bg-border-dark/50 cursor-pointer"
              onClick={() => setSelectedOrden(orden)}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    orden.estado === 'EN_PROCESO' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                  }`}>
                    {orden.estado === 'EN_PROCESO' ? 'En Proceso' : orden.estado}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDispensacion(orden)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      orden.dispensacion?.completada
                        ? 'bg-success/20 text-success'
                        : 'bg-primary/20 text-primary hover:bg-primary/30'
                    }`}
                  >
                    {orden.dispensacion?.completada ? 'Dispensación ✓' : 'Dispensar'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenLineClearance(orden)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      orden.lineClearance?.completado
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning hover:bg-warning/30'
                    }`}
                  >
                    {orden.lineClearance?.completado ? 'Línea Limpia ✓' : 'Despeje de Línea'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {showDispensacion && selectedOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Dispensación - {selectedOrden.codigo}</h2>
              <button
                onClick={() => {
                  setShowDispensacion(false)
                  setDispensacionData(null)
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-muted text-sm mb-4">
                Registro digital del pesaje exacto de cada ingrediente según BOM. 
                Todos los datos son inalterables una vez confirmados.
              </p>
              
              {loadingDispensacion ? (
                <div className="p-8 text-center text-text-muted">Cargando ingredientes...</div>
              ) : dispensacionData && dispensacionData.items && dispensacionData.items.length > 0 ? (
                <div className="space-y-4">
                  {dispensacionData.items.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-text-light font-medium">{item.materialNombre}</p>
                          <p className="text-text-muted text-sm">Requerido: {item.cantidadRequerida} {item.unidadRequerida}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Peso real"
                            value={item.cantidadPesada || ''}
                            onChange={(e) => handleUpdateDispensacionItem(index, e.target.value)}
                            className="w-32 h-10 px-3 rounded-lg bg-card-dark border border-border-dark text-text-light text-sm focus:outline-0 focus:ring-2 focus:ring-primary/50"
                          />
                          <span className="text-text-muted text-sm">{item.unidadRequerida}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="material-symbols-outlined text-base">scale</span>
                        <span>Equipo: {dispensacionData.equipoUtilizado || 'BAL-001'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  <p>No se encontraron ingredientes para esta orden</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDispensacion(false)
                    setDispensacionData(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                  disabled={savingDispensacion}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDispensacion}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={savingDispensacion || loadingDispensacion}
                >
                  {savingDispensacion ? 'Guardando...' : 'Confirmar Dispensación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLineClearance && selectedOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Despeje de Línea - {selectedOrden.codigo}</h2>
              <button
                onClick={() => {
                  setShowLineClearance(false)
                  setLineClearanceData(null)
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-muted text-sm mb-4">
                Checklist formal para verificar que la línea está limpia y lista para producción.
                Mitiga riesgos de contaminación cruzada (NC Crítica).
              </p>
              
              {loadingLineClearance ? (
                <div className="p-8 text-center text-text-muted">Cargando checklist...</div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      checked={lineClearanceData?.lineaLimpia || false}
                      onChange={(e) => handleUpdateLineClearanceCheck('lineaLimpia', e.target.checked)}
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">Línea completamente limpia y desinfectada</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      checked={lineClearanceData?.sinResiduos || false}
                      onChange={(e) => handleUpdateLineClearanceCheck('sinResiduos', e.target.checked)}
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">Sin residuos de lote anterior</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      checked={lineClearanceData?.equiposVerificados || false}
                      onChange={(e) => handleUpdateLineClearanceCheck('equiposVerificados', e.target.checked)}
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">Equipos verificados y calibrados</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      checked={lineClearanceData?.documentacionCompleta || false}
                      onChange={(e) => handleUpdateLineClearanceCheck('documentacionCompleta', e.target.checked)}
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">Documentación de limpieza completa</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      checked={lineClearanceData?.materialesCorrectos || false}
                      onChange={(e) => handleUpdateLineClearanceCheck('materialesCorrectos', e.target.checked)}
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">Verificación de materiales correctos</span>
                  </label>
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-warning text-sm font-medium mb-2">
                  <span className="material-symbols-outlined align-middle">warning</span> Registro Inalterable
                </p>
                <p className="text-text-muted text-xs">
                  Una vez confirmado, este registro será firmado digitalmente y no podrá ser modificado.
                  Fecha y hora se registrarán automáticamente.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowLineClearance(false)
                    setLineClearanceData(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                  disabled={savingLineClearance}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLineClearance}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={savingLineClearance || loadingLineClearance}
                >
                  {savingLineClearance ? 'Guardando...' : 'Confirmar y Firmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Produccion
