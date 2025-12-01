import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'

const Produccion = () => {
  const { user } = useAuth()

  // Verificar permisos - Solo Supervisor de Calidad y Administrador
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
  const [ordenes, setOrdenes] = useState([
    {
      id: 'OP-2024-001',
      producto: 'Vitamina D3 2000UI',
      cantidad: 1000,
      estado: 'En Proceso',
      fechaInicio: '15/01/2024',
      dispensacion: { completada: true, items: 5, total: 5 },
      lineClearance: { completado: false }
    }
  ])

  const [selectedOrden, setSelectedOrden] = useState(null)
  const [showDispensacion, setShowDispensacion] = useState(false)
  const [showLineClearance, setShowLineClearance] = useState(false)

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

      {/* Lista de Órdenes */}
      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
        <div className="p-4 border-b border-border-dark">
          <h2 className="text-text-light font-semibold">Órdenes de Producción</h2>
        </div>
        <div className="divide-y divide-border-dark">
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className="p-4 hover:bg-border-dark/50 cursor-pointer"
              onClick={() => setSelectedOrden(orden)}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-text-light font-medium">{orden.id}</p>
                  <p className="text-text-muted text-sm">{orden.producto}</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Cantidad</p>
                  <p className="text-text-light">{orden.cantidad} unidades</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Estado</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    orden.estado === 'En Proceso' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                  }`}>
                    {orden.estado}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDispensacion(true)
                      setSelectedOrden(orden)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      orden.dispensacion.completada
                        ? 'bg-success/20 text-success'
                        : 'bg-primary/20 text-primary hover:bg-primary/30'
                    }`}
                  >
                    {orden.dispensacion.completada ? 'Dispensación ✓' : 'Dispensar'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLineClearance(true)
                      setSelectedOrden(orden)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      orden.lineClearance.completado
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning hover:bg-warning/30'
                    }`}
                  >
                    {orden.lineClearance.completado ? 'Línea Limpia ✓' : 'Line Clearance'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Dispensación */}
      {showDispensacion && selectedOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Dispensación - {selectedOrden.id}</h2>
              <button
                onClick={() => setShowDispensacion(false)}
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
              
              <div className="space-y-4">
                {[
                  { ingrediente: 'Colecalciferol', requerido: 50, unidad: 'mg', pesado: null },
                  { ingrediente: 'Excipiente', requerido: 1950, unidad: 'mg', pesado: null }
                ].map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-text-light font-medium">{item.ingrediente}</p>
                        <p className="text-text-muted text-sm">Requerido: {item.requerido} {item.unidad}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Peso real"
                          className="w-32 h-10 px-3 rounded-lg bg-card-dark border border-border-dark text-text-light text-sm focus:outline-0 focus:ring-2 focus:ring-primary/50"
                        />
                        <span className="text-text-muted text-sm">{item.unidad}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="material-symbols-outlined text-base">scale</span>
                      <span>Equipo: BAL-001 (Calibrado hasta 30/06/2024)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDispensacion(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // TODO: Guardar dispensación con timestamp y usuario
                    setShowDispensacion(false)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  Confirmar Dispensación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Line Clearance */}
      {showLineClearance && selectedOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Despeje de Línea (Line Clearance) - {selectedOrden.id}</h2>
              <button
                onClick={() => setShowLineClearance(false)}
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
              
              <div className="space-y-3">
                {[
                  'Línea completamente limpia y desinfectada',
                  'Sin residuos de lote anterior',
                  'Equipos verificados y calibrados',
                  'Documentación de limpieza completa',
                  'Verificación de materiales correctos'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-3 p-3 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-text-light text-sm">{item}</span>
                  </label>
                ))}
              </div>

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
                  onClick={() => setShowLineClearance(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // TODO: Guardar line clearance con firma digital
                    setShowLineClearance(false)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  Confirmar y Firmar
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

