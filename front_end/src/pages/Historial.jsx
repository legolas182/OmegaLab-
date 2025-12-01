import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import pruebaService from '../services/pruebaService'
import ideaService from '../services/ideaService'

const Historial = () => {
  const { user } = useAuth()
  const isAnalista = hasAnyRole(user, 'ANALISTA_LABORATORIO')
  const isSupervisorQA = hasAnyRole(user, 'SUPERVISOR_QA')
  const isAdmin = hasAnyRole(user, 'ADMINISTRADOR')
  
  const [pruebas, setPruebas] = useState([])
  const [ideas, setIdeas] = useState([])
  const [loadingPruebas, setLoadingPruebas] = useState(false)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [selectedPrueba, setSelectedPrueba] = useState(null)
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [loadingIdea, setLoadingIdea] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filterEstado, setFilterEstado] = useState('TODAS')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const loadPruebas = useCallback(async () => {
    setLoadingPruebas(true)
    try {
      // Por ahora, usar el mismo endpoint para todos los roles
      // El backend debería devolver todas las pruebas si el usuario tiene permisos
      const data = await pruebaService.getMisPruebas()
      
      // Filtrar pruebas que deben estar en el historial:
      // 1. Pruebas completadas (COMPLETADA, OOS, RECHAZADA)
      // 2. O pruebas cuya idea asociada esté en estado PRUEBA_APROBADA
      let pruebasCompletadas = data.filter(p => {
        const pruebaCompletada = p.estado === 'COMPLETADA' || 
                                 p.estado === 'OOS' || 
                                 p.estado === 'RECHAZADA'
        const ideaAprobada = p.ideaEstado === 'PRUEBA_APROBADA'
        return pruebaCompletada || ideaAprobada
      })
      
      // Aplicar filtro adicional si está seleccionado
      if (filterEstado !== 'TODAS') {
        pruebasCompletadas = pruebasCompletadas.filter(p => p.estado === filterEstado)
      }
      
      // Ordenar por fecha más reciente primero
      pruebasCompletadas.sort((a, b) => {
        const fechaA = new Date(a.fechaFin || a.fechaMuestreo || a.createdAt || 0)
        const fechaB = new Date(b.fechaFin || b.fechaMuestreo || b.createdAt || 0)
        return fechaB - fechaA
      })
      
      setPruebas(pruebasCompletadas)
    } catch (error) {
      console.error('Error al cargar pruebas:', error)
    } finally {
      setLoadingPruebas(false)
    }
  }, [filterEstado])

  const loadFormulas = useCallback(async () => {
    setLoadingIdeas(true)
    try {
      // Cargar todas las fórmulas que han pasado por QA
      // Estados: APROBADA, PRUEBA_APROBADA, EN_PRODUCCION, RECHAZADA
      const data = await ideaService.getIdeas({ estado: '', categoria: '', prioridad: '', search: '' })
      
      // Filtrar fórmulas que han pasado por el proceso de QA
      let formulasQA = data.filter(idea => {
        const estado = idea.estado || ''
        return estado === 'APROBADA' || 
               estado === 'PRUEBA_APROBADA' || 
               estado === 'EN_PRODUCCION' || 
               estado === 'RECHAZADA'
      })
      
      // Aplicar filtro por estado si está seleccionado
      if (filterEstado !== 'TODAS') {
        formulasQA = formulasQA.filter(idea => {
          const estado = idea.estado || ''
          return estado === filterEstado
        })
      }
      
      // Ordenar por fecha más reciente primero
      formulasQA.sort((a, b) => {
        const fechaA = new Date(a.updatedAt || a.createdAt || 0)
        const fechaB = new Date(b.updatedAt || b.createdAt || 0)
        return fechaB - fechaA
      })
      
      setIdeas(formulasQA)
    } catch (error) {
      console.error('Error al cargar fórmulas:', error)
    } finally {
      setLoadingIdeas(false)
    }
  }, [filterEstado])

  useEffect(() => {
    if (isAnalista) {
      loadPruebas()
    } else {
      loadFormulas()
    }
  }, [isAnalista, loadPruebas, loadFormulas])

  const handleVerDetalles = async (pruebaId) => {
    try {
      const prueba = await pruebaService.getPruebaById(pruebaId)
      setSelectedPrueba(prueba)
      
      // Cargar la idea asociada si existe para obtener el BOM modificado
      if (prueba.ideaId) {
        setLoadingIdea(true)
        try {
          const idea = await ideaService.getIdeaById(prueba.ideaId)
          setSelectedIdea(idea)
        } catch (error) {
          console.error('Error al cargar idea:', error)
          setSelectedIdea(null)
        } finally {
          setLoadingIdea(false)
        }
      } else {
        setSelectedIdea(null)
      }
      
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error al cargar prueba:', error)
      alert('Error al cargar detalles: ' + (error.message || 'Error desconocido'))
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

  const handleEnviarASupervisor = async (prueba) => {
    if (!prueba.ideaId) {
      alert('Esta prueba no está asociada a una idea')
      return
    }

    if (!confirm('¿Estás seguro de enviar esta prueba al Supervisor QA para revisión?')) {
      return
    }

    try {
      // Cambiar el estado de la idea a EN_REVISION para que el supervisor pueda revisarla
      await ideaService.changeEstado(prueba.ideaId, 'en_revision')
      alert('Prueba enviada al Supervisor QA exitosamente')
      loadPruebas() // Recargar para actualizar la lista
    } catch (error) {
      console.error('Error al enviar al supervisor:', error)
      alert('Error al enviar al supervisor: ' + (error.message || 'Error desconocido'))
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-success/20 text-success border-success/30'
      case 'OOS':
        return 'bg-danger/20 text-danger border-danger/30'
      case 'RECHAZADA':
        return 'bg-warning/20 text-warning border-warning/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'Completada'
      case 'OOS':
        return 'OOS'
      case 'RECHAZADA':
        return 'Rechazada'
      default:
        return estado
    }
  }

  const getIdeaEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADA':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PRUEBA_APROBADA':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'EN_PRODUCCION':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'RECHAZADA':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getIdeaEstadoLabel = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADA':
        return 'Aprobada para Pruebas'
      case 'PRUEBA_APROBADA':
        return 'Pruebas Aprobadas'
      case 'EN_PRODUCCION':
        return 'En Producción'
      case 'RECHAZADA':
        return 'Rechazada'
      default:
        return estado
    }
  }

  // Calcular paginación
  const currentData = isAnalista ? pruebas : ideas
  const totalPages = Math.ceil(currentData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = currentData.slice(startIndex, endIndex)

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [filterEstado])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-light">
            {isAnalista ? 'Historial de Pruebas' : 'Historial de QA'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-text-muted text-xs font-medium">Filtrar:</label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-input-dark border border-border-dark text-text-light text-xs"
          >
            <option value="TODAS">Todas</option>
            {isAnalista ? (
              <>
                <option value="COMPLETADA">Completadas</option>
                <option value="OOS">OOS</option>
                <option value="RECHAZADA">Rechazadas</option>
              </>
            ) : (
              <>
                <option value="APROBADA">Aprobadas</option>
                <option value="PRUEBA_APROBADA">Pruebas Aprobadas</option>
                <option value="EN_PRODUCCION">En Producción</option>
                <option value="RECHAZADA">Rechazadas</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Lista de Fórmulas (para Supervisor QA y Admin) */}
      {!isAnalista && (
        <div className="flex-1 flex flex-col bg-card-dark rounded-lg border border-border-dark overflow-hidden min-h-0 max-h-full">
          {loadingIdeas ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-muted text-sm">Cargando...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-text-muted text-4xl mb-2">inbox</span>
                <p className="text-text-muted text-sm">No hay fórmulas en el historial de QA</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full">
                  <thead className="bg-input-dark/50 border-b border-border-dark sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Título</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Objetivo</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Estado</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Creado por</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Fecha</th>
                      <th className="px-3 py-2 text-center text-text-muted text-xs font-semibold uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {paginatedData.map((idea) => (
                    <tr
                      key={idea.id}
                      className="hover:bg-input-dark/30 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-text-light text-xs font-medium">{idea.titulo}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-text-muted text-xs truncate block max-w-[200px]" title={idea.objetivo || '-'}>
                          {idea.objetivo || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getIdeaEstadoColor(idea.estado)}`}>
                          {getIdeaEstadoLabel(idea.estado)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-text-muted text-xs">{idea.createdByName || '-'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-text-muted text-xs">
                          {idea.updatedAt
                            ? new Date(idea.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : idea.createdAt
                            ? new Date(idea.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={async () => {
                              try {
                                const ideaCompleta = await ideaService.getIdeaById(idea.id)
                                setSelectedIdea(ideaCompleta)
                                setShowDetailsModal(true)
                              } catch (error) {
                                console.error('Error al cargar idea:', error)
                                alert('Error al cargar detalles: ' + (error.message || 'Error desconocido'))
                              }
                            }}
                            className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark bg-input-dark/30 flex-shrink-0">
                  <div className="text-text-muted text-xs">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, currentData.length)} de {currentData.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-input-dark border border-border-dark text-text-light text-xs font-medium hover:bg-border-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                currentPage === page
                                  ? 'bg-primary text-white'
                                  : 'bg-input-dark border border-border-dark text-text-light hover:bg-border-dark'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="text-text-muted text-xs">...</span>
                        }
                        return null
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-input-dark border border-border-dark text-text-light text-xs font-medium hover:bg-border-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Siguiente
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Lista de Pruebas (para Analista) */}
      {isAnalista && (
        <div className="flex-1 flex flex-col bg-card-dark rounded-lg border border-border-dark overflow-hidden min-h-0 max-h-full">
          {loadingPruebas ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-muted text-sm">Cargando...</p>
            </div>
          ) : pruebas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-text-muted text-4xl mb-2">inbox</span>
                <p className="text-text-muted text-sm">No hay pruebas completadas</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full">
                  <thead className="bg-input-dark/50 border-b border-border-dark sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Código</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Tipo</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Idea</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Estado</th>
                      <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Fecha</th>
                      <th className="px-3 py-2 text-center text-text-muted text-xs font-semibold uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {paginatedData.map((prueba) => (
                    <tr
                      key={prueba.id}
                      className="hover:bg-input-dark/30 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-text-light text-xs font-medium">{prueba.codigoMuestra}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-text-muted text-xs">{prueba.tipoPrueba}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {prueba.ideaTitulo ? (
                          <span className="text-text-muted text-xs truncate block max-w-[200px]" title={prueba.ideaTitulo}>
                            {prueba.ideaTitulo}
                          </span>
                        ) : (
                          <span className="text-text-muted/50 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getEstadoColor(prueba.estado)}`}>
                          {getEstadoLabel(prueba.estado)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-text-muted text-xs">
                          {prueba.fechaFin
                            ? new Date(prueba.fechaFin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : prueba.fechaMuestreo
                            ? new Date(prueba.fechaMuestreo).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleVerDetalles(prueba.id)}
                            className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark bg-input-dark/30 flex-shrink-0">
                  <div className="text-text-muted text-xs">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, currentData.length)} de {currentData.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-input-dark border border-border-dark text-text-light text-xs font-medium hover:bg-border-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                currentPage === page
                                  ? 'bg-primary text-white'
                                  : 'bg-input-dark border border-border-dark text-text-light hover:bg-border-dark'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="text-text-muted text-xs">...</span>
                        }
                        return null
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-input-dark border border-border-dark text-text-light text-xs font-medium hover:bg-border-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Siguiente
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de Detalles de Fórmula (para Supervisor QA) */}
      {showDetailsModal && selectedIdea && !selectedPrueba && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false)
              setSelectedIdea(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-text-light font-semibold text-xl mb-2">
                    {selectedIdea.titulo}
                  </h2>
                  <p className="text-text-muted text-sm">{selectedIdea.descripcion}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${getIdeaEstadoColor(selectedIdea.estado)}`}>
                    {getIdeaEstadoLabel(selectedIdea.estado)}
                  </span>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedIdea(null)
                    }}
                    className="text-text-muted hover:text-text-light"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Información General */}
              <div>
                <h3 className="text-text-light font-semibold mb-3 text-sm">Información General</h3>
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark space-y-2">
                  {selectedIdea.objetivo && (
                    <div>
                      <p className="text-text-muted text-xs mb-1">Objetivo:</p>
                      <p className="text-text-light text-sm">{selectedIdea.objetivo}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted text-xs">Categoría:</span>
                      <p className="text-text-light font-medium">{selectedIdea.categoria || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Creado por:</span>
                      <p className="text-text-light font-medium">{selectedIdea.createdByName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs">Fecha:</span>
                      <p className="text-text-light font-medium">
                        {selectedIdea.createdAt ? new Date(selectedIdea.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                      </p>
                    </div>
                    {selectedIdea.asignadoANombre && (
                      <div>
                        <span className="text-text-muted text-xs">Asignado a:</span>
                        <p className="text-text-light font-medium">{selectedIdea.asignadoANombre}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles de IA */}
              {selectedIdea.detallesIA && (() => {
                const aiDetails = parseAIDetails(selectedIdea.detallesIA)
                if (aiDetails && aiDetails.ingredientes && Array.isArray(aiDetails.ingredientes) && aiDetails.ingredientes.length > 0) {
                  return (
                    <div>
                      <h3 className="text-text-light font-semibold mb-3 text-sm">Ingredientes</h3>
                      <div className="space-y-2">
                        {aiDetails.ingredientes.map((ing, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-text-light font-medium text-sm">{ing.nombre || 'Ingrediente'}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              {ing.cantidad && (
                                <div>
                                  <span className="text-text-muted">Cantidad:</span>
                                  <p className="text-primary font-medium">{ing.cantidad} {ing.unidad || ''}</p>
                                </div>
                              )}
                              {ing.porcentaje && (
                                <div>
                                  <span className="text-text-muted">%:</span>
                                  <p className="text-text-light">{ing.porcentaje}%</p>
                                </div>
                              )}
                              {ing.funcion && (
                                <div className="col-span-2">
                                  <span className="text-text-muted">Función:</span>
                                  <p className="text-text-light">{ing.funcion}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedIdea(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Prueba */}
      {showDetailsModal && selectedPrueba && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false)
              setSelectedPrueba(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-text-light font-semibold text-xl mb-2">
                    {selectedPrueba.codigoMuestra}
                  </h2>
                  <p className="text-text-muted text-sm">{selectedPrueba.tipoPrueba}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${getEstadoColor(selectedPrueba.estado)}`}>
                    {getEstadoLabel(selectedPrueba.estado)}
                  </span>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedPrueba(null)
                      setSelectedIdea(null)
                    }}
                    className="text-text-muted hover:text-text-light"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Fecha - Sin cuadrado */}
              {selectedPrueba.fechaFin && (
                <div>
                  <p className="text-text-muted text-xs mb-1">Fecha de Finalización</p>
                  <p className="text-text-light text-sm">
                    {new Date(selectedPrueba.fechaFin).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Pruebas Realizadas y Resultados */}
              <div>
                <h3 className="text-text-light font-semibold mb-3 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">science</span>
                  Pruebas Realizadas y Resultados
                </h3>
                {selectedPrueba.resultados && selectedPrueba.resultados.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPrueba.resultados.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg border ${
                          result.cumpleEspecificacion === false
                            ? 'bg-danger/10 border-danger/30'
                            : 'bg-success/10 border-success/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-text-light font-medium text-sm">{result.parametro}</p>
                            {result.especificacion && (
                              <p className="text-text-muted text-xs mt-1">
                                Especificación: {result.especificacion}
                              </p>
                            )}
                            <p className="text-text-light text-sm mt-1">
                              Resultado: <span className="text-primary font-semibold">{result.resultado}</span> {result.unidad || ''}
                            </p>
                            {result.observaciones && (
                              <p className="text-text-muted text-xs mt-1 italic">{result.observaciones}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              result.cumpleEspecificacion === false
                                ? 'bg-danger/20 text-danger'
                                : 'bg-success/20 text-success'
                            }`}
                          >
                            {result.cumpleEspecificacion === false ? 'OOS' : 'Cumple'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                    <p className="text-text-muted text-sm">No hay resultados registrados para esta prueba</p>
                  </div>
                )}
              </div>

              {/* BOM Nuevo con Volúmenes */}
              {selectedIdea && selectedIdea.detallesIA && (() => {
                const aiDetails = parseAIDetails(selectedIdea.detallesIA)
                if (aiDetails && aiDetails.bomModificado && Array.isArray(aiDetails.bomModificado) && aiDetails.bomModificado.length > 0) {
                  return (
                    <div>
                      <h3 className="text-text-light font-semibold mb-3 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">list</span>
                        BOM Nuevo con Volúmenes
                      </h3>
                      <div className="space-y-2">
                        {aiDetails.bomModificado.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-text-light font-medium text-sm">{item.ingrediente || 'Ingrediente'}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              {item.cantidadPropuesta && (
                                <div>
                                  <span className="text-text-muted">Cantidad Propuesta:</span>
                                  <p className="text-primary font-medium">{item.cantidadPropuesta}</p>
                                </div>
                              )}
                              {item.porcentajePropuesto && (
                                <div>
                                  <span className="text-text-muted">% Propuesto:</span>
                                  <p className="text-text-light">{item.porcentajePropuesto}</p>
                                </div>
                              )}
                              {item.unidad && (
                                <div>
                                  <span className="text-text-muted">Unidad:</span>
                                  <p className="text-text-light">{item.unidad}</p>
                                </div>
                              )}
                              {item.volumen && (
                                <div>
                                  <span className="text-text-muted">Volumen:</span>
                                  <p className="text-text-light font-medium">{item.volumen}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                {selectedPrueba.ideaId && selectedPrueba.ideaEstado === 'PRUEBA_APROBADA' && (
                  <button
                    onClick={() => handleEnviarASupervisor(selectedPrueba)}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Enviar a Supervisor QA
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPrueba(null)
                    setSelectedIdea(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Historial
