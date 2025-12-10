import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import ideaService from '../services/ideaService'
import pruebaService from '../services/pruebaService'

const Aprobacion = () => {
  const { user } = useAuth()
  const isSupervisorQA = hasAnyRole(user, 'SUPERVISOR_QA')
  const isAdmin = hasAnyRole(user, 'ADMINISTRADOR')

  const [formulas, setFormulas] = useState([])
  const [loadingFormulas, setLoadingFormulas] = useState(false)
  const [selectedFormula, setSelectedFormula] = useState(null)
  const [showConfirmarModal, setShowConfirmarModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [supervisoresCalidad, setSupervisoresCalidad] = useState([])
  const [loadingSupervisores, setLoadingSupervisores] = useState(false)
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null)
  const [cantidadProduccion, setCantidadProduccion] = useState('')
  const [pruebasPorFormula, setPruebasPorFormula] = useState(new Map())
  const [showAnalisisModal, setShowAnalisisModal] = useState(false)

  // Verificar permisos de acceso
  if (!user || (!isSupervisorQA && !isAdmin)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">No tienes permisos para acceder a Aprobación / QA</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadFormulas()
  }, [])

  useEffect(() => {
    if (formulas.length > 0) {
      loadPruebasForFormulas()
    }
  }, [formulas])

  const loadFormulas = async () => {
    setLoadingFormulas(true)
    try {
      // Cargar solo fórmulas en estado PRUEBA_APROBADA (tanto aceptadas como rechazadas en pruebas)
      const data = await ideaService.getIdeas({ estado: 'prueba_aprobada', categoria: '', prioridad: '', search: '' })
      setFormulas(data)
    } catch (error) {
      console.error('Error al cargar fórmulas:', error)
    } finally {
      setLoadingFormulas(false)
    }
  }

  const loadSupervisoresCalidad = async () => {
    setLoadingSupervisores(true)
    try {
      const data = await ideaService.getSupervisoresCalidad()
      setSupervisoresCalidad(data)
    } catch (error) {
      console.error('Error al cargar supervisores de calidad:', error)
    } finally {
      setLoadingSupervisores(false)
    }
  }

  const loadPruebasForFormulas = async () => {
    const pruebasMap = new Map()
    for (const formula of formulas) {
      try {
        const pruebas = await pruebaService.getPruebasByIdeaId(formula.id)
        pruebasMap.set(formula.id, pruebas)
      } catch (error) {
        console.error(`Error al cargar pruebas para fórmula ${formula.id}:`, error)
      }
    }
    setPruebasPorFormula(pruebasMap)
  }

  const handleConfirmarProduccion = async () => {
    if (!selectedSupervisorId) {
      alert('Por favor selecciona un supervisor de calidad')
      return
    }

    const cantidad = parseInt(cantidadProduccion)
    if (!cantidad || cantidad <= 0) {
      alert('Por favor ingresa una cantidad válida')
      return
    }

    try {
      await ideaService.confirmarProduccion(selectedFormula.id, selectedSupervisorId, cantidad)
      alert('Fórmula confirmada para producción exitosamente. El lote ha sido creado automáticamente.')
      setShowConfirmarModal(false)
      setSelectedFormula(null)
      setSelectedSupervisorId(null)
      setCantidadProduccion('')
      loadFormulas()
      
      // Disparar evento para actualizar el Kanban en Ideas.jsx
      window.dispatchEvent(new CustomEvent('ideaEstadoChanged', {
        detail: { ideaId: selectedFormula.id, nuevoEstado: 'EN_PRODUCCION' }
      }))
    } catch (error) {
      console.error('Error al confirmar producción:', error)
      alert('Error al confirmar producción: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleRechazar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas rechazar esta fórmula? Se moverá al historial y se eliminará del kanban.')) {
      return
    }

    try {
      await ideaService.changeEstado(selectedFormula.id, 'rechazada')
      alert('Fórmula rechazada y movida al historial')
      setShowRechazarModal(false)
      setSelectedFormula(null)
      loadFormulas()
      
      // Disparar evento para actualizar el Kanban en Ideas.jsx
      window.dispatchEvent(new CustomEvent('ideaEstadoChanged', {
        detail: { ideaId: selectedFormula.id, nuevoEstado: 'RECHAZADA' }
      }))
    } catch (error) {
      console.error('Error al rechazar fórmula:', error)
      alert('Error al rechazar fórmula: ' + (error.message || 'Error desconocido'))
    }
  }

  const openConfirmarModal = (formula) => {
    setSelectedFormula(formula)
    setSelectedSupervisorId(null)
    setCantidadProduccion(formula.cantidadSugerida ? formula.cantidadSugerida.toString() : '1000')
    if (supervisoresCalidad.length === 0) {
      loadSupervisoresCalidad()
    }
    setShowConfirmarModal(true)
  }

  const openRechazarModal = (formula) => {
    setSelectedFormula(formula)
    setShowRechazarModal(true)
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'prueba_aprobada':
        return 'bg-emerald-500/20 text-emerald-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const parseAIDetails = (detallesIA) => {
    if (!detallesIA) return null
    try {
      return JSON.parse(detallesIA)
    } catch (e) {
      return null
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Aprobación / QA</h1>
          <p className="text-text-muted text-sm mt-1">Revisión y aprobación final de ideas que han completado las pruebas de análisis del laboratorio</p>
        </div>
      </div>

      {/* Ideas Pendientes de Aprobación QA */}
      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-text-light font-semibold">Ideas Pendientes de Aprobación QA</h2>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
            {formulas.length}
          </span>
        </div>

        {loadingFormulas ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            <p className="text-text-muted ml-2">Cargando ideas...</p>
          </div>
        ) : formulas.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-text-muted mb-4">check_circle</span>
            <p className="text-text-light text-lg font-semibold mb-2">No hay ideas pendientes</p>
            <p className="text-text-muted text-sm">
              Las ideas que completen las pruebas de análisis aparecerán aquí para tu revisión
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">TÍTULO</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">ESTADO</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">CREADO POR</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">FECHA</th>
                  <th className="px-4 py-3 text-left text-text-muted text-xs font-semibold uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {formulas.map((idea) => {
                  const pruebas = pruebasPorFormula.get(idea.id) || []
                  const pruebasCompletadas = pruebas.filter(p => {
                    const estado = (p.estado || '').toLowerCase()
                    return estado === 'completada' || estado === 'oos' || estado === 'rechazada'
                  })
                  const todasPasaron = pruebasCompletadas.every(p => {
                    const estado = (p.estado || '').toLowerCase()
                    return estado === 'completada'
                  })

                  return (
                    <tr key={idea.id} className="border-b border-border-dark hover:bg-card-dark/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-text-light font-medium text-sm">{idea.titulo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          todasPasaron 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {todasPasaron ? 'Pruebas Aprobadas' : 'Aprobada para Pruebas'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-text-light text-sm">{idea.createdByName || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-text-light text-sm">
                          {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedFormula(idea)}
                          className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center"
                          title="Ver Detalles"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles de Idea */}
      {selectedFormula && !showConfirmarModal && !showRechazarModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedFormula(null)
              setShowAnalisisModal(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-8">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 z-10">
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-text-light text-2xl font-bold">{selectedFormula.titulo}</h2>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getEstadoColor(selectedFormula.estado)}`}>
                  Pruebas Completadas
                </span>
              </div>
              <button
                  onClick={() => {
                    setSelectedFormula(null)
                    setShowAnalisisModal(false)
                  }}
                className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAnalisisModal(true)}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">science</span>
                  Ver Análisis del Analista
                </button>
                <button
                  onClick={() => {
                    setSelectedFormula(null)
                    setShowAnalisisModal(false)
                    openConfirmarModal(selectedFormula)
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Confirmar para Producción
                </button>
                <button
                  onClick={() => {
                    setSelectedFormula(null)
                    setShowAnalisisModal(false)
                    openRechazarModal(selectedFormula)
                  }}
                  className="px-4 py-2 rounded-lg bg-danger/20 text-danger font-medium hover:bg-danger/30 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Rechazar
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información General */}
              <div>
                <h3 className="text-text-light font-semibold text-lg mb-3">Información General</h3>
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark space-y-3">
                  <p className="text-text-muted text-sm mb-3">{selectedFormula.descripcion}</p>
                  
                  {selectedFormula.objetivo && (
                    <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-text-muted text-xs mb-1">Objetivo:</p>
                      <p className="text-text-light text-sm font-medium">{selectedFormula.objetivo}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {selectedFormula.productoOrigenNombre && (
                      <div>
                        <span className="text-text-muted text-xs">Producto origen:</span>
                        <p className="text-text-light font-medium">{selectedFormula.productoOrigenNombre}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-muted text-xs">Categoría:</span>
                      <p className="text-text-light font-medium">{selectedFormula.categoria || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Creado por:</span>
                      <p className="text-text-light font-medium">{selectedFormula.createdByName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Fecha:</span>
                      <p className="text-text-light font-medium">
                        {selectedFormula.createdAt ? new Date(selectedFormula.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                      </p>
                    </div>
                    {selectedFormula.asignadoANombre && (
                      <div>
                        <span className="text-text-muted text-xs">Asignado a:</span>
                        <p className="text-text-light font-medium">{selectedFormula.asignadoANombre}</p>
                      </div>
                    )}
                    {selectedFormula.cantidadSugerida && (
                      <div>
                        <span className="text-text-muted text-xs">Cantidad Sugerida:</span>
                        <p className="text-primary font-semibold">{selectedFormula.cantidadSugerida} unidades</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles de IA - Idea Generada por IA */}
              {selectedFormula.detallesIA && (
                <div>
                  <h3 className="text-text-light font-semibold text-lg mb-3">Idea Generada por IA</h3>
              {(() => {
                    const aiDetails = parseAIDetails(selectedFormula.detallesIA)
                    if (!aiDetails) {
                      return (
                        <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                          <p className="text-text-muted text-sm">{selectedFormula.detallesIA}</p>
                        </div>
                      )
                    }

                return (
                    <div className="space-y-4">
                        {aiDetails.materialesSeleccionados && Array.isArray(aiDetails.materialesSeleccionados) && aiDetails.materialesSeleccionados.length > 0 && (
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">auto_awesome</span>
                              Materias Primas Seleccionadas Automáticamente por la IA
                            </h4>
                            <div className="mb-3">
                              <p className="text-text-muted text-xs mb-2">
                                La IA analizó el inventario completo y seleccionó {aiDetails.materialesSeleccionados.length} materia(s) prima(s) que mejor cumplen con el objetivo:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {aiDetails.materialesSeleccionados.map((materialId, idx) => (
                                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
                                    ID: {materialId}
                            </span>
                                ))}
                          </div>
                            </div>
                            {aiDetails.justificacionSeleccion && (
                              <div className="mt-3 pt-3 border-t border-green-500/20">
                                <p className="text-text-muted text-xs mb-2 font-medium">Justificación de la Selección:</p>
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                                    {aiDetails.justificacionSeleccion.replace(/\\n/g, '\n')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {aiDetails.materialesSugeridosBD && Array.isArray(aiDetails.materialesSugeridosBD) && aiDetails.materialesSugeridosBD.length > 0 && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">science</span>
                              Nuevos Compuestos Sugeridos de Bases de Datos Externas
                            </h4>
                            <p className="text-text-muted text-xs mb-3">
                              La IA identificó {aiDetails.materialesSugeridosBD.length} compuesto(s) que no están en el inventario pero son necesarios para la fórmula:
                            </p>
                            <div className="space-y-3">
                              {aiDetails.materialesSugeridosBD.map((compuesto, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-card-dark border border-border-dark">
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="text-text-light font-semibold text-base">{compuesto.nombre || 'Compuesto'}</h5>
                                    {(compuesto.fuente || compuesto.source) && (
                                      <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                                        {compuesto.fuente || compuesto.source}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                                    {compuesto.formulaMolecular && (
                                      <div>
                                        <span className="text-text-muted text-xs">Fórmula Molecular:</span>
                                        <p className="text-text-light font-medium font-mono">{compuesto.formulaMolecular}</p>
                                      </div>
                                    )}
                                    {compuesto.pesoMolecular && (
                                      <div>
                                        <span className="text-text-muted text-xs">Peso Molecular:</span>
                                        <p className="text-text-light font-medium">{compuesto.pesoMolecular} g/mol</p>
                                      </div>
                                    )}
                                    {compuesto.logP !== null && compuesto.logP !== undefined && (
                                      <div>
                                        <span className="text-text-muted text-xs">LogP:</span>
                                        <p className="text-text-light font-medium">{compuesto.logP}</p>
                                      </div>
                                    )}
                                  </div>
                                  {compuesto.solubilidad && (
                                    <div className="mb-2">
                                      <span className="text-text-muted text-xs">Solubilidad:</span>
                                      <p className="text-text-light text-sm">{compuesto.solubilidad}</p>
                                    </div>
                                  )}
                                  {compuesto.propiedades && (
                                    <div className="mb-2">
                                      <span className="text-text-muted text-xs">Propiedades:</span>
                                      <p className="text-text-light text-sm">{compuesto.propiedades}</p>
                                    </div>
                                  )}
                                  {compuesto.justificacion && (
                            <div className="mt-3 pt-3 border-t border-border-dark">
                                      <span className="text-text-muted text-xs font-medium">¿Por qué es necesario?</span>
                                      <p className="text-text-light text-sm mt-1">{compuesto.justificacion}</p>
                                </div>
                                  )}
                                </div>
                              ))}
                              </div>
                            </div>
                          )}
                          
                        {aiDetails.ingredientes && Array.isArray(aiDetails.ingredientes) && aiDetails.ingredientes.length > 0 && (
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">list</span>
                              Lista de Ingredientes
                            </h4>
                              <div className="space-y-2">
                              {aiDetails.ingredientes.map((ingrediente, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-text-light font-medium">{ingrediente.nombre || 'Ingrediente'}</span>
                                    {ingrediente.funcion && (
                                      <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                                        {ingrediente.funcion}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    {ingrediente.cantidad !== undefined && (
                                      <div>
                                        <span className="text-text-muted">Cantidad:</span>
                                        <p className="text-text-light font-medium">
                                          {ingrediente.cantidad} {ingrediente.unidad || 'g'}
                                        </p>
                                      </div>
                                    )}
                                    {ingrediente.porcentaje !== undefined && (
                                      <div>
                                        <span className="text-text-muted">Porcentaje:</span>
                                        <p className="text-primary font-medium">{ingrediente.porcentaje}%</p>
                                      </div>
                                    )}
                                    {ingrediente.materialId && (
                                      <div>
                                        <span className="text-text-muted">Material ID:</span>
                                        <p className="text-text-light">{ingrediente.materialId}</p>
                                      </div>
                                    )}
                                  </div>
                                  {ingrediente.formulaMolecular && (
                                    <div className="mt-2 pt-2 border-t border-border-dark">
                                      <p className="text-text-muted text-xs mb-1">Fórmula Molecular:</p>
                                      <p className="text-text-light text-sm font-mono">{ingrediente.formulaMolecular}</p>
                                      {ingrediente.pesoMolecular && (
                                        <p className="text-text-muted text-xs mt-1">Peso Molecular: {ingrediente.pesoMolecular} g/mol</p>
                                      )}
                                    </div>
                                  )}
                                  {ingrediente.especificacionesTecnicas && (
                                    <div className="mt-2 pt-2 border-t border-border-dark">
                                      <p className="text-text-muted text-xs mb-2">Especificaciones Técnicas:</p>
                                      <div className="space-y-1 text-xs">
                                        {ingrediente.especificacionesTecnicas.requiereSDS && (
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs text-primary">description</span>
                                            <span className="text-text-light">Requiere SDS (Safety Data Sheet)</span>
                                          </div>
                                        )}
                                        {ingrediente.especificacionesTecnicas.requiereCOA && (
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs text-primary">verified</span>
                                            <span className="text-text-light">Requiere COA (Certificate of Analysis)</span>
                                          </div>
                                        )}
                                        {ingrediente.especificacionesTecnicas.purezaMinima && (
                                          <div>
                                            <span className="text-text-muted">Pureza Mínima: </span>
                                            <span className="text-text-light font-medium">{ingrediente.especificacionesTecnicas.purezaMinima}</span>
                                          </div>
                                        )}
                                        {ingrediente.especificacionesTecnicas.humedadMaxima && (
                                          <div>
                                            <span className="text-text-muted">Humedad Máxima: </span>
                                            <span className="text-text-light font-medium">{ingrediente.especificacionesTecnicas.humedadMaxima}</span>
                                          </div>
                                        )}
                                        {ingrediente.especificacionesTecnicas.condicionesAlmacenamiento && (
                                          <div>
                                            <span className="text-text-muted">Almacenamiento: </span>
                                            <span className="text-text-light">{ingrediente.especificacionesTecnicas.condicionesAlmacenamiento}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {(ingrediente.contenidoProteina !== undefined || ingrediente.contenidoCarbohidratos !== undefined || ingrediente.contenidoGrasas !== undefined) && (
                                    <div className="mt-2 pt-2 border-t border-border-dark">
                                      <p className="text-text-muted text-xs mb-1">Contenido Nutricional:</p>
                                      <div className="flex flex-wrap gap-3 text-xs">
                                        {ingrediente.contenidoProteina !== undefined && (
                                          <span className="text-text-light">
                                            Proteína: <span className="font-medium">{ingrediente.contenidoProteina}%</span>
                                      </span>
                                        )}
                                        {ingrediente.contenidoCarbohidratos !== undefined && (
                                          <span className="text-text-light">
                                            Carbohidratos: <span className="font-medium">{ingrediente.contenidoCarbohidratos}%</span>
                                          </span>
                                        )}
                                        {ingrediente.contenidoGrasas !== undefined && (
                                          <span className="text-text-light">
                                            Grasas: <span className="font-medium">{ingrediente.contenidoGrasas}%</span>
                                          </span>
                                        )}
                                    </div>
                                    </div>
                                  )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {(aiDetails.rendimiento || aiDetails.unidadRendimiento) && (
                          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">scale</span>
                              Rendimiento del Batch
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-text-light text-lg font-bold">
                                {aiDetails.rendimiento || 'N/A'} {aiDetails.unidadRendimiento || 'g'}
                              </span>
                              <span className="text-text-muted text-sm">(1 kg batch)</span>
                        </div>
                    </div>
                        )}

                        {aiDetails.formulaQuimicaGeneral && (
                          <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">science</span>
                              Fórmula Química General
                            </h4>
                            <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                              <p className="text-text-light text-sm leading-relaxed whitespace-pre-line font-mono">
                                {aiDetails.formulaQuimicaGeneral.replace(/\\n/g, '\n')}
                              </p>
                  </div>
                          </div>
                        )}

                        {aiDetails.parametrosFisicoquimicos && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">science</span>
                              Parámetros Fisicoquímicos Predichos
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aiDetails.parametrosFisicoquimicos.solubilidad && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">Solubilidad</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.solubilidad}</p>
                        </div>
                              )}
                              {aiDetails.parametrosFisicoquimicos.logP && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">LogP Promedio</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.logP}</p>
                                </div>
                              )}
                              {aiDetails.parametrosFisicoquimicos.pH && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">pH Estimado</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.pH}</p>
                                </div>
                              )}
                              {aiDetails.parametrosFisicoquimicos.estabilidad && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">Estabilidad</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.estabilidad}</p>
                                </div>
                              )}
                              {aiDetails.parametrosFisicoquimicos.compatibilidad && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">Compatibilidad</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.compatibilidad}</p>
                                </div>
                              )}
                              {aiDetails.parametrosFisicoquimicos.biodisponibilidad && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <p className="text-text-muted text-xs mb-1">Biodisponibilidad</p>
                                  <p className="text-text-light text-sm">{aiDetails.parametrosFisicoquimicos.biodisponibilidad}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {aiDetails.protocoloAnalisis && (
                          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">biotech</span>
                              Protocolo de Análisis Completo
                            </h4>
                      <div className="space-y-4">
                              {aiDetails.protocoloAnalisis.pruebasFisicas && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">straighten</span>
                                    Pruebas Físicas
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    {aiDetails.protocoloAnalisis.pruebasFisicas.apariencia && (
                                      <div>
                                        <span className="text-text-muted text-xs">Apariencia:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasFisicas.apariencia}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasFisicas.olor && (
                                      <div>
                                        <span className="text-text-muted text-xs">Olor:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasFisicas.olor}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasFisicas.solubilidad && (
                                      <div>
                                        <span className="text-text-muted text-xs">Solubilidad:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasFisicas.solubilidad}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasFisicas.humedad && (
                                      <div>
                                        <span className="text-text-muted text-xs">Humedad:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasFisicas.humedad}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasFisicas.densidadAparente && (
                                      <div>
                                        <span className="text-text-muted text-xs">Densidad Aparente:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasFisicas.densidadAparente}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {aiDetails.protocoloAnalisis.pruebasQuimicas && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">science</span>
                                    Pruebas Químicas
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.proteina && (
                                      <div>
                                        <span className="text-text-muted text-xs">Proteína:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.proteina}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.grasa && (
                                      <div>
                                        <span className="text-text-muted text-xs">Grasa:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.grasa}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.carbohidratos && (
                                      <div>
                                        <span className="text-text-muted text-xs">Carbohidratos:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.carbohidratos}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.creatina && (
                                      <div>
                                        <span className="text-text-muted text-xs">Creatina:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.creatina}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.perfilAminoacidos && (
                                      <div>
                                        <span className="text-text-muted text-xs">Perfil de Aminoácidos:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.perfilAminoacidos}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.metalesPesados && (
                                      <div>
                                        <span className="text-text-muted text-xs">Metales Pesados:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.metalesPesados}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.pH && (
                                      <div>
                                        <span className="text-text-muted text-xs">pH:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.pH}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasQuimicas.cenizas && (
                                      <div>
                                        <span className="text-text-muted text-xs">Cenizas:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasQuimicas.cenizas}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {aiDetails.protocoloAnalisis.pruebasMicrobiologicas && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">bug_report</span>
                                    Pruebas Microbiológicas
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    {aiDetails.protocoloAnalisis.pruebasMicrobiologicas.bacteriasAerobias && (
                                      <div>
                                        <span className="text-text-muted text-xs">Bacterias Aerobias:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasMicrobiologicas.bacteriasAerobias}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasMicrobiologicas.mohosLevaduras && (
                                      <div>
                                        <span className="text-text-muted text-xs">Mohos y Levaduras:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasMicrobiologicas.mohosLevaduras}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasMicrobiologicas.eColi && (
                                      <div>
                                        <span className="text-text-muted text-xs">E. coli:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasMicrobiologicas.eColi}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasMicrobiologicas.salmonella && (
                                      <div>
                                        <span className="text-text-muted text-xs">Salmonella:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasMicrobiologicas.salmonella}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.pruebasMicrobiologicas.coliformes && (
                                      <div>
                                        <span className="text-text-muted text-xs">Coliformes:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.pruebasMicrobiologicas.coliformes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {aiDetails.protocoloAnalisis.directricesAnalista && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    Directrices para el Analista
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    {aiDetails.protocoloAnalisis.directricesAnalista.preparacionMuestras && (
                                      <div>
                                        <span className="text-text-muted text-xs">Preparación de Muestras:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.directricesAnalista.preparacionMuestras}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.calibracionEquipos && (
                                      <div>
                                        <span className="text-text-muted text-xs">Calibración de Equipos:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.directricesAnalista.calibracionEquipos}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.controlCalidad && (
                                      <div>
                                        <span className="text-text-muted text-xs">Control de Calidad:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.directricesAnalista.controlCalidad}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.interpretacionResultados && (
                                      <div>
                                        <span className="text-text-muted text-xs">Interpretación de Resultados:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.directricesAnalista.interpretacionResultados}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.documentacion && (
                                      <div>
                                        <span className="text-text-muted text-xs">Documentación:</span>
                                        <p className="text-text-light">{aiDetails.protocoloAnalisis.directricesAnalista.documentacion}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {aiDetails.recomendacionesAdicionales && (
                          <div className="p-4 rounded-lg bg-lime-500/10 border border-lime-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">recommend</span>
                              Recomendaciones Adicionales
                            </h4>
                            <div className="space-y-3">
                              {aiDetails.recomendacionesAdicionales.bcaasHmb && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">BCAAs y HMB</h5>
                                  <p className="text-text-light text-sm whitespace-pre-line">{aiDetails.recomendacionesAdicionales.bcaasHmb.replace(/\\n/g, '\n')}</p>
                                </div>
                              )}
                              {aiDetails.recomendacionesAdicionales.carbohidratos && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">Carbohidratos</h5>
                                  <p className="text-text-light text-sm whitespace-pre-line">{aiDetails.recomendacionesAdicionales.carbohidratos.replace(/\\n/g, '\n')}</p>
                                </div>
                              )}
                              {aiDetails.recomendacionesAdicionales.vitaminasMinerales && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">Vitaminas y Minerales</h5>
                                  <p className="text-text-light text-sm whitespace-pre-line">{aiDetails.recomendacionesAdicionales.vitaminasMinerales.replace(/\\n/g, '\n')}</p>
                                </div>
                              )}
                              {aiDetails.recomendacionesAdicionales.optimizacion && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">Optimización</h5>
                                  <p className="text-text-light text-sm whitespace-pre-line">{aiDetails.recomendacionesAdicionales.optimizacion.replace(/\\n/g, '\n')}</p>
                                </div>
                              )}
                              {aiDetails.recomendacionesAdicionales.consideracionesRegulatorias && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">Consideraciones Regulatorias</h5>
                                  <p className="text-text-light text-sm whitespace-pre-line">{aiDetails.recomendacionesAdicionales.consideracionesRegulatorias.replace(/\\n/g, '\n')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {aiDetails.escenariosPositivos && Array.isArray(aiDetails.escenariosPositivos) && aiDetails.escenariosPositivos.length > 0 && (
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">trending_up</span>
                              Escenarios Positivos
                            </h4>
                            <ul className="space-y-2">
                              {aiDetails.escenariosPositivos.map((escenario, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-text-light text-sm">
                                  <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                  <span>{escenario}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiDetails.escenariosNegativos && Array.isArray(aiDetails.escenariosNegativos) && aiDetails.escenariosNegativos.length > 0 && (
                          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              Escenarios Negativos / Consideraciones
                            </h4>
                            <ul className="space-y-2">
                              {aiDetails.escenariosNegativos.map((escenario, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-text-light text-sm">
                                  <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">info</span>
                                  <span>{escenario}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiDetails.bomModificado && Array.isArray(aiDetails.bomModificado) && aiDetails.bomModificado.length > 0 && (
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">list</span>
                              BOM Modificado
                            </h4>
                            <div className="space-y-2">
                              {aiDetails.bomModificado.map((item, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-text-light font-medium">{item.ingrediente || 'Ingrediente'}</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <span className="text-text-muted">Cantidad Actual:</span>
                                      <p className="text-text-light font-medium">{item.cantidadActual || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-text-muted">Cantidad Propuesta:</span>
                                      <p className="text-primary font-medium">{item.cantidadPropuesta || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-text-muted">% Actual:</span>
                                      <p className="text-text-light">{item.porcentajeActual || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-text-muted">% Propuesto:</span>
                                      <p className="text-primary">{item.porcentajePropuesto || 'N/A'}</p>
                                    </div>
                                  </div>
                                  {item.razon && (
                                    <p className="text-text-muted text-xs mt-2 italic">Razón: {item.razon}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {/* Modal de Análisis del Analista */}
      {showAnalisisModal && selectedFormula && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnalisisModal(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-8">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-400">science</span>
                <h2 className="text-text-light text-2xl font-bold">Análisis y Pruebas Completadas por el Analista</h2>
              </div>
                <button
                onClick={() => setShowAnalisisModal(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
                </button>
              </div>

            <div className="p-6">
              {(() => {
                const pruebas = pruebasPorFormula.get(selectedFormula.id) || []
                const pruebasCompletadas = pruebas.filter(p => {
                  const estado = (p.estado || '').toLowerCase()
                  return estado === 'completada' || estado === 'oos' || estado === 'rechazada'
                })
                
                if (pruebasCompletadas.length === 0) {
                  return (
                    <div className="p-8 rounded-lg bg-input-dark border border-border-dark text-center">
                      <span className="material-symbols-outlined text-6xl text-text-muted mb-4 block">science</span>
                      <p className="text-text-muted text-lg">No hay análisis completados aún</p>
            </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {pruebasCompletadas.map((prueba) => (
                      <div key={prueba.id} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-text-light font-medium text-lg">{prueba.tipoPrueba}</p>
                              {prueba.codigoMuestra && (
                                <span className="text-text-muted text-sm">({prueba.codigoMuestra})</span>
                              )}
          </div>
                            {prueba.analistaNombre && (
                              <p className="text-text-muted text-sm">Analista: <span className="text-text-light font-medium">{prueba.analistaNombre}</span></p>
                            )}
                            {prueba.descripcion && (
                              <p className="text-text-muted text-sm mt-1">{prueba.descripcion}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded text-sm font-medium ${
                            (prueba.estado || '').toLowerCase() === 'completada' ? 'bg-success/20 text-success' :
                            (prueba.estado || '').toLowerCase() === 'oos' ? 'bg-danger/20 text-danger' :
                            (prueba.estado || '').toLowerCase() === 'rechazada' ? 'bg-danger/20 text-danger' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {prueba.estado}
                          </span>
                        </div>
                        
                        {prueba.resultados && prueba.resultados.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border-dark">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">assessment</span>
                              Resultados Registrados
                            </h4>
                            <div className="space-y-2">
                              {prueba.resultados.map((resultado, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${
                                  resultado.cumpleEspecificacion === false
                                    ? 'bg-danger/10 border-danger/30'
                                    : 'bg-success/10 border-success/30'
                                }`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-text-light font-medium">{resultado.parametro}</p>
                                      <p className="text-text-light text-sm mt-1">
                                        Resultado: <span className="text-primary font-semibold">{resultado.resultado}</span> {resultado.unidad || ''}
                                      </p>
                                      {resultado.especificacion && (
                                        <p className="text-text-muted text-xs mt-1">
                                          Especificación: {resultado.especificacion}
                                        </p>
                                      )}
                                      {resultado.observaciones && (
                                        <p className="text-text-muted text-xs mt-1 italic">
                                          {resultado.observaciones}
                                        </p>
                                      )}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      resultado.cumpleEspecificacion === false
                                        ? 'bg-danger/20 text-danger'
                                        : 'bg-success/20 text-success'
                                    }`}>
                                      {resultado.cumpleEspecificacion === false ? '✗ OOS' : '✓ Cumple'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prueba.pruebasRequeridas && (
                          <div className="mt-3 pt-3 border-t border-border-dark">
                            <h4 className="text-text-light font-semibold mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">description</span>
                              Protocolo de Análisis Ejecutado
                            </h4>
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                              <div className="whitespace-pre-line text-text-light text-sm leading-relaxed">
                                {prueba.pruebasRequeridas}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Producción */}
      {showConfirmarModal && selectedFormula && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Confirmar para Producción</h2>
              <button
                onClick={() => {
                  setShowConfirmarModal(false)
                  setSelectedFormula(null)
                  setSelectedSupervisorId(null)
                  setCantidadProduccion('')
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-text-light font-medium mb-2">{selectedFormula.titulo}</p>
                <p className="text-text-muted text-sm">{selectedFormula.descripcion}</p>
              </div>

              {selectedFormula.cantidadSugerida && (
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-text-muted text-xs mb-1">Cantidad sugerida por el analista:</p>
                  <p className="text-primary font-semibold text-lg">{selectedFormula.cantidadSugerida} unidades</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">
                    Cantidad de Producción <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadProduccion}
                    onChange={(e) => setCantidadProduccion(e.target.value)}   
                    placeholder={selectedFormula.cantidadSugerida ? `Sugerida: ${selectedFormula.cantidadSugerida}` : "Ingresa la cantidad"}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">
                    Supervisor de Calidad <span className="text-danger">*</span>
                  </label>
                  <select
                    value={selectedSupervisorId || ''}
                    onChange={(e) => setSelectedSupervisorId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecciona un supervisor</option>
                    {supervisoresCalidad.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.nombre} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmarModal(false)
                    setSelectedFormula(null)
                    setSelectedSupervisorId(null)
                    setCantidadProduccion('')
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarProduccion}
                  disabled={!selectedSupervisorId || !cantidadProduccion || parseInt(cantidadProduccion) <= 0}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Producción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Aprobacion
