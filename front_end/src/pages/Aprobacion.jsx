<<<<<<< HEAD
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
      alert('Fórmula confirmada para producción exitosamente')
      setShowConfirmarModal(false)
      setSelectedFormula(null)
      setSelectedSupervisorId(null)
      setCantidadProduccion('')
      loadFormulas()
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
    } catch (error) {
      console.error('Error al rechazar fórmula:', error)
      alert('Error al rechazar fórmula: ' + (error.message || 'Error desconocido'))
    }
  }

  const openConfirmarModal = (formula) => {
    setSelectedFormula(formula)
    setSelectedSupervisorId(null)
    setCantidadProduccion('')
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
=======
import { useState } from 'react'

const Aprobacion = () => {
  const [lotes, setLotes] = useState([
    {
      id: 'LOTE-2024-001',
      producto: 'Vitamina D3 2000UI',
      cantidad: 1000,
      fechaProduccion: '15/01/2024',
      estado: 'Pendiente Liberación',
      pruebas: { completadas: true, todasCumplen: false },
      documentacion: { completa: true },
      requiereProfesional: true
    }
  ])

  const [selectedLote, setSelectedLote] = useState(null)
  const [showLiberacion, setShowLiberacion] = useState(false)
>>>>>>> origin/main

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Aprobación / QA</h1>
<<<<<<< HEAD
          <p className="text-text-muted text-sm mt-1">Revisión y aprobación final de fórmulas que han completado las pruebas de análisis</p>
        </div>
      </div>

      {/* Fórmulas Pendientes de Aprobación */}
      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-text-light font-semibold">Fórmulas Pendientes de Aprobación QA</h2>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
            {formulas.length}
          </span>
        </div>

        {loadingFormulas ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            <p className="text-text-muted ml-2">Cargando fórmulas...</p>
          </div>
        ) : formulas.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-text-muted mb-4">check_circle</span>
            <p className="text-text-light text-lg font-semibold mb-2">No hay fórmulas pendientes</p>
            <p className="text-text-muted text-sm">
              Las fórmulas que completen las pruebas de análisis aparecerán aquí para tu revisión
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {formulas.map((formula) => {
              const pruebas = pruebasPorFormula.get(formula.id) || []
              const tienePruebasCompletadas = pruebas.some(p => 
                p.estado === 'COMPLETADA' || p.estado === 'OOS' || p.estado === 'RECHAZADA'
              )

              return (
                <div
                  key={formula.id}
                  className="p-4 hover:bg-border-dark/50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-text-light font-medium mb-1">{formula.titulo}</p>
                          <p className="text-text-muted text-sm line-clamp-2">{formula.descripcion}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(formula.estado)}`}>
                              Pruebas Completadas
                            </span>
                            {formula.categoria && (
                              <span className="text-text-muted text-xs">{formula.categoria}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs mb-1">Pruebas</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        tienePruebasCompletadas ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {pruebas.length} {pruebas.length === 1 ? 'prueba' : 'pruebas'}
                      </span>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs mb-1">Asignado a</p>
                      <p className="text-text-light text-sm">{formula.asignadoANombre || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setSelectedFormula(formula)}
                        className="px-3 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => openConfirmarModal(formula)}
                        className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Confirmar Producción
                      </button>
                      <button
                        onClick={() => openRechazarModal(formula)}
                        className="px-3 py-2 rounded-lg bg-danger/20 text-danger text-sm font-medium hover:bg-danger/30 transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalles de Fórmula */}
      {selectedFormula && !showConfirmarModal && !showRechazarModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedFormula(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-8">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-text-light text-2xl font-bold">{selectedFormula.titulo}</h2>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getEstadoColor(selectedFormula.estado)}`}>
                  Pruebas Completadas
                </span>
              </div>
              <button
                onClick={() => setSelectedFormula(null)}
                className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-text-light font-semibold text-lg mb-3">Información General</h3>
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark space-y-2">
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
                  </div>
                </div>
              </div>

              {/* Pruebas Realizadas */}
              {(() => {
                const pruebas = pruebasPorFormula.get(selectedFormula.id) || []
                if (pruebas.length === 0) return null

                return (
                  <div>
                    <h3 className="text-text-light font-semibold text-lg mb-3">Pruebas Realizadas</h3>
                    <div className="space-y-3">
                      {pruebas.map((prueba) => (
                        <div key={prueba.id} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-text-light font-medium">{prueba.codigoMuestra}</p>
                              <p className="text-text-muted text-sm">{prueba.tipoPrueba}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              prueba.estado === 'COMPLETADA' ? 'bg-success/20 text-success' :
                              prueba.estado === 'OOS' ? 'bg-danger/20 text-danger' :
                              prueba.estado === 'RECHAZADA' ? 'bg-danger/20 text-danger' :
                              'bg-warning/20 text-warning'
                            }`}>
                              {prueba.estado}
                            </span>
                          </div>
                          {prueba.descripcion && (
                            <p className="text-text-muted text-sm mt-2">{prueba.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Pruebas Requeridas */}
              {selectedFormula.pruebasRequeridas && (
                <div>
                  <h3 className="text-text-light font-semibold text-lg mb-3">Pruebas Requeridas (Generadas por IA)</h3>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="whitespace-pre-line text-text-light text-sm leading-relaxed bg-card-dark p-3 rounded-lg border border-border-dark">
                      {selectedFormula.pruebasRequeridas}
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles de IA */}
              {selectedFormula.detallesIA && (
                <div>
                  <h3 className="text-text-light font-semibold text-lg mb-3">Detalles de IA</h3>
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
                        {/* BOM Modificado */}
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

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-border-dark">
                <button
                  onClick={() => {
                    setSelectedFormula(null)
                    openConfirmarModal(selectedFormula)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirmar para Producción
                </button>
                <button
                  onClick={() => {
                    setSelectedFormula(null)
                    openRechazarModal(selectedFormula)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-danger/20 text-danger font-medium hover:bg-danger/30 transition-colors"
                >
                  Rechazar
                </button>
              </div>
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
=======
          <p className="text-text-muted text-sm mt-1">Gestión de No Conformidades, CAPA y Liberación Final de Producto</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border-dark">
        <div className="flex gap-8">
          <button className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-4">
            <p className="text-sm font-bold">Liberación de Lotes</p>
          </button>
          <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-text-muted pb-3 pt-4 hover:text-text-light">
            <p className="text-sm font-bold">No Conformidades</p>
          </button>
          <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-text-muted pb-3 pt-4 hover:text-text-light">
            <p className="text-sm font-bold">CAPA</p>
          </button>
        </div>
      </div>

      {/* Lotes Pendientes */}
      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-text-light font-semibold">Lotes Pendientes de Liberación</h2>
          <span className="bg-danger/20 text-danger px-2 py-1 rounded-full text-xs font-medium">
            {lotes.filter(l => l.estado === 'Pendiente Liberación').length}
          </span>
        </div>
        <div className="divide-y divide-border-dark">
          {lotes.map((lote) => (
            <div
              key={lote.id}
              className="p-4 hover:bg-border-dark/50 cursor-pointer"
              onClick={() => setSelectedLote(lote)}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-text-light font-medium">{lote.id}</p>
                  <p className="text-text-muted text-sm">{lote.producto}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Cantidad</p>
                  <p className="text-text-light">{lote.cantidad} unidades</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Pruebas</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    lote.pruebas.todasCumplen ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  }`}>
                    {lote.pruebas.todasCumplen ? 'Cumple' : 'OOS Activo'}
                  </span>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Documentación</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    lote.documentacion.completa ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {lote.documentacion.completa ? 'Completa' : 'Incompleta'}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLiberacion(true)
                      setSelectedLote(lote)
                    }}
                    disabled={!lote.pruebas.todasCumplen || !lote.documentacion.completa}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Liberar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Conformidades */}
      <div className="rounded-lg bg-card-dark border border-border-dark">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-text-light font-semibold">No Conformidades Activas</h2>
          <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">
            Nueva NC
          </button>
        </div>
        <div className="divide-y divide-border-dark">
          {[
            { id: 'NC-2024-001', descripcion: 'Falta de validación de sistema computarizado', criticidad: 'Crítica', fecha: '10/01/2024', estado: 'Abierta' },
            { id: 'NC-2024-002', descripcion: 'Liberación sin profesional idóneo', criticidad: 'Crítica', fecha: '12/01/2024', estado: 'En Investigación' },
            { id: 'NC-2024-003', descripcion: 'Trazabilidad incompleta de proceso', criticidad: 'Mayor', fecha: '14/01/2024', estado: 'Abierta' }
          ].map((nc) => (
            <div key={nc.id} className="p-4 hover:bg-border-dark/50 cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-text-light font-medium">{nc.id}</p>
                  <p className="text-text-muted text-sm">{nc.descripcion}</p>
                  <p className="text-text-muted text-xs mt-1">Abierta: {nc.fecha}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    nc.criticidad === 'Crítica' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  }`}>
                    {nc.criticidad}
                  </span>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                    {nc.estado}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Liberación */}
      {showLiberacion && selectedLote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Liberación Final de Producto</h2>
              <button
                onClick={() => setShowLiberacion(false)}
>>>>>>> origin/main
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
<<<<<<< HEAD
                <p className="text-text-light font-medium mb-2">{selectedFormula.titulo}</p>
                <p className="text-text-muted text-sm">{selectedFormula.descripcion}</p>
              </div>

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
                    placeholder="Ingresa la cantidad"
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">
                    Supervisor de Calidad <span className="text-danger">*</span>
                  </label>
                  {loadingSupervisores ? (
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      Cargando supervisores...
                    </div>
                  ) : (
                    <select
                      value={selectedSupervisorId || ''}
                      onChange={(e) => setSelectedSupervisorId(parseInt(e.target.value))}
                      className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Seleccionar supervisor...</option>
                      {supervisoresCalidad.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.nombre} - {supervisor.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
=======
                <p className="text-text-light font-medium mb-2">{selectedLote.id}</p>
                <p className="text-text-muted text-sm">{selectedLote.producto}</p>
              </div>

              {/* Verificación de Requisitos */}
              <div className="space-y-3 mb-6">
                <h3 className="text-text-light font-semibold">Verificación de Requisitos</h3>
                {[
                  { item: 'Todas las pruebas cumplen especificaciones', cumplido: true },
                  { item: 'Documentación completa y aprobada', cumplido: true },
                  { item: 'Trazabilidad completa del proceso', cumplido: true },
                  { item: 'Profesional idóneo autorizado', cumplido: selectedLote.requiereProfesional }
                ].map((req, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-input-dark">
                    <span className={`material-symbols-outlined ${
                      req.cumplido ? 'text-success' : 'text-danger'
                    }`}>
                      {req.cumplido ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="text-text-light text-sm">{req.item}</span>
                  </div>
                ))}
              </div>

              {/* Firma Digital */}
              <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-warning text-sm font-medium mb-2">
                  <span className="material-symbols-outlined align-middle">warning</span> Requisito Crítico
                </p>
                <p className="text-text-muted text-xs mb-4">
                  Según Decreto 3249 de 2006, la liberación debe ser realizada por un profesional idóneo.
                  Este registro será inalterable una vez firmado.
                </p>
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Profesional Responsable</label>
                  <select className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50">
                    <option>Seleccionar profesional...</option>
                    <option>Dr. Juan Pérez - Químico Farmacéutico</option>
                    <option>Dra. María González - Químico Farmacéutico</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-text-light text-sm font-medium mb-2">Observaciones</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="Observaciones adicionales sobre la liberación..."
                  />
                </div>
>>>>>>> origin/main
              </div>

              <div className="flex gap-3">
                <button
<<<<<<< HEAD
                  onClick={() => {
                    setShowConfirmarModal(false)
                    setSelectedFormula(null)
                    setSelectedSupervisorId(null)
                    setCantidadProduccion('')
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark transition-colors"
=======
                  onClick={() => setShowLiberacion(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
>>>>>>> origin/main
                >
                  Cancelar
                </button>
                <button
<<<<<<< HEAD
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

      {/* Modal de Rechazar */}
      {showRechazarModal && selectedFormula && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Rechazar Fórmula</h2>
              <button
                onClick={() => {
                  setShowRechazarModal(false)
                  setSelectedFormula(null)
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-text-light font-medium mb-2">{selectedFormula.titulo}</p>
                <p className="text-text-muted text-sm mb-4">{selectedFormula.descripcion}</p>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-warning text-sm font-medium mb-2">
                    <span className="material-symbols-outlined align-middle">warning</span> Advertencia
                  </p>
                  <p className="text-text-muted text-sm">
                    Esta acción moverá la fórmula al historial y la eliminará del kanban. No podrás revertir esta acción.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRechazarModal(false)
                    setSelectedFormula(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  className="flex-1 px-4 py-3 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-colors"
                >
                  Confirmar Rechazo
=======
                  onClick={() => {
                    // TODO: Implementar firma digital y registro inalterable
                    alert('Lote liberado exitosamente. Registro firmado digitalmente.')
                    setShowLiberacion(false)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  Confirmar y Firmar Liberación
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
