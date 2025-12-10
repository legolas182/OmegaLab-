import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import ideaService from '../services/ideaService'
import pruebaService from '../services/pruebaService'

const Ideas = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [expandedIdeas, setExpandedIdeas] = useState(new Set())
  const [selectedFormula, setSelectedFormula] = useState(null)
  const [draggedFormula, setDraggedFormula] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [showAnalystDialog, setShowAnalystDialog] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [analistas, setAnalistas] = useState([])
  const [loadingAnalistas, setLoadingAnalistas] = useState(false)
  const [selectedAnalistaId, setSelectedAnalistaId] = useState(null)
  const [pruebasPorIdea, setPruebasPorIdea] = useState(new Map())

  // Verificar permisos de acceso
  const isSupervisorQA = hasAnyRole(user, 'SUPERVISOR_QA')
  const isAdmin = hasAnyRole(user, 'ADMINISTRADOR')
  const isAnalista = hasAnyRole(user, 'ANALISTA_LABORATORIO')

  if (!user || (!isSupervisorQA && !isAdmin && !isAnalista)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">No tienes permisos para acceder a Nuevas Fórmulas</p>
        </div>
      </div>
    )
  }

  // Cargar ideas solo una vez al inicio
  useEffect(() => {
    loadIdeas()

    // Escuchar eventos de cambio de estado desde otros módulos (Aprobacion, etc.)
    const handleEstadoChanged = (event) => {
      const { ideaId, nuevoEstado } = event.detail
      // Recargar ideas para reflejar el cambio de estado
      loadIdeas()
    }

    // Escuchar eventos de creación de nuevas ideas (desde IA, etc.)
    const handleIdeaCreated = (event) => {
      // Recargar ideas para mostrar la nueva idea en el kanban
      loadIdeas()
    }

    window.addEventListener('ideaEstadoChanged', handleEstadoChanged)
    window.addEventListener('ideaCreated', handleIdeaCreated)

    return () => {
      window.removeEventListener('ideaEstadoChanged', handleEstadoChanged)
      window.removeEventListener('ideaCreated', handleIdeaCreated)
    }
  }, [])

  // Cargar pruebas solo cuando se cargan las ideas inicialmente, no en cada cambio
  useEffect(() => {
    if (ideas.length > 0 && !loadingIdeas) {
      // Usar un timeout para evitar cargar pruebas durante actualizaciones rápidas
      const timeoutId = setTimeout(() => {
        loadPruebasForIdeas()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas.length])

  const loadIdeas = async () => {
    setLoadingIdeas(true)
    try {
      // Si es analista, cargar solo sus ideas asignadas en estado EN_PRUEBA
      if (isAnalista) {
        const data = await ideaService.getMisIdeas()
        // Filtrar solo ideas en estado EN_PRUEBA (las prueba_aprobada van al historial)
        const ideasEnPrueba = data.filter(idea => (idea.estado || '').toLowerCase() === 'en_prueba')
        setIdeas(ideasEnPrueba)
      } else {
        // Si es Supervisor QA o Admin, cargar todas las ideas
        const data = await ideaService.getIdeas({ estado: '', categoria: '', prioridad: '', search: '' })
        setIdeas(data)
      }
    } catch (error) {
      console.error('Error al cargar ideas:', error)
    } finally {
      setLoadingIdeas(false)
    }
  }


  const loadAnalistas = async () => {
    setLoadingAnalistas(true)
    try {
      const data = await ideaService.getAnalistas()
      setAnalistas(data)
    } catch (error) {
      console.error('Error al cargar analistas:', error)
    } finally {
      setLoadingAnalistas(false)
    }
  }

  const handleChangeEstado = async (idea, nuevoEstado) => {
    // Si el nuevo estado es EN_PRUEBA, mostrar diálogo de selección de analista
    if (nuevoEstado === 'en_prueba') {
      setSelectedIdea(idea)
      setSelectedAnalistaId(null)
      if (analistas.length === 0) {
        await loadAnalistas()
      }
      setShowAnalystDialog(true)
      return
    }

    // Para otros estados, cambiar directamente
    try {
      const updatedIdea = await ideaService.changeEstado(idea.id, nuevoEstado)
      // Actualizar la idea localmente de forma optimista (sin recargar todo)
      setIdeas(prevIdeas =>
        prevIdeas.map(i =>
          i.id === idea.id
            ? { ...i, ...updatedIdea, estado: updatedIdea.estado || nuevoEstado.toUpperCase() }
            : i
        )
      )
      // Si hay un modal abierto con esta fórmula, actualizarlo también
      if (selectedFormula && selectedFormula.id === idea.id) {
        setSelectedFormula(prev => prev ? { ...prev, ...updatedIdea, estado: updatedIdea.estado || nuevoEstado.toUpperCase() } : null)
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
      // En caso de error, recargar para sincronizar
      loadIdeas()
    }
  }

  const handleAssignToAnalyst = async () => {
    if (!selectedAnalistaId) {
      toast.error('Por favor selecciona un analista')
      return
    }

    try {
      const updatedIdea = await ideaService.changeEstado(selectedIdea.id, 'en_prueba', selectedAnalistaId)
      // Actualizar la idea localmente de forma optimista (sin recargar todo)
      setIdeas(prevIdeas =>
        prevIdeas.map(i =>
          i.id === selectedIdea.id
            ? { ...i, ...updatedIdea, estado: updatedIdea.estado || 'EN_PRUEBA' }
            : i
        )
      )
      // Si hay un modal abierto con esta fórmula, actualizarlo también
      if (selectedFormula && selectedFormula.id === selectedIdea.id) {
        setSelectedFormula(prev => prev ? { ...prev, ...updatedIdea, estado: updatedIdea.estado || 'EN_PRUEBA' } : null)
      }
      setShowAnalystDialog(false)
      setSelectedIdea(null)
      setSelectedAnalistaId(null)
    } catch (error) {
      console.error('Error al asignar a analista:', error)
      toast.error('Error al asignar analista: ' + (error.message || 'Error desconocido'))
      // En caso de error, recargar para sincronizar
      loadIdeas()
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'generada':
        return 'bg-blue-500/20 text-blue-400'
      case 'en_revision':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'aprobada':
        return 'bg-green-500/20 text-green-400'
      case 'en_prueba':
        return 'bg-purple-500/20 text-purple-400'
      case 'prueba_aprobada':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'rechazada':
        return 'bg-red-500/20 text-red-400'
      case 'en_produccion':
        return 'bg-indigo-500/20 text-indigo-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'generada':
        return 'Generada'
      case 'en_revision':
        return 'En Revisión'
      case 'aprobada':
        return 'Aprobada'
      case 'en_prueba':
        return 'En Prueba'
      case 'prueba_aprobada':
        return 'Aprobación Final'
      case 'rechazada':
        return 'Archivada'
      case 'en_produccion':
        return 'En Producción'
      default:
        return estado
    }
  }

  // Definir columnas del kanban (sin incluir rechazada ni prueba_aprobada - se gestionan en historial y aprobación)
  const kanbanColumns = [
    { id: 'generada', label: 'Generada', borderClass: 'border-blue-500/30', bgClass: 'bg-blue-500/10', dotClass: 'bg-blue-500', badgeClass: 'bg-blue-500/20 text-blue-400' },
    { id: 'en_revision', label: 'En Revisión', borderClass: 'border-yellow-500/30', bgClass: 'bg-yellow-500/10', dotClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'aprobada', label: 'Aprobada', borderClass: 'border-green-500/30', bgClass: 'bg-green-500/10', dotClass: 'bg-green-500', badgeClass: 'bg-green-500/20 text-green-400' },
    { id: 'en_prueba', label: 'En Prueba', borderClass: 'border-purple-500/30', bgClass: 'bg-purple-500/10', dotClass: 'bg-purple-500', badgeClass: 'bg-purple-500/20 text-purple-400' },
    { id: 'en_produccion', label: 'En Producción', borderClass: 'border-indigo-500/30', bgClass: 'bg-indigo-500/10', dotClass: 'bg-indigo-500', badgeClass: 'bg-indigo-500/20 text-indigo-400' }
  ]

  // Agrupar fórmulas por estado (excluyendo rechazada y prueba_aprobada del kanban)
  // rechazada se archiva, prueba_aprobada se gestiona en la página de Aprobación
  const formulasByEstado = ideas.reduce((acc, idea) => {
    const estado = (idea.estado || 'generada').toLowerCase()
    // Las fórmulas rechazadas y prueba_aprobada no aparecen en el kanban
    if (estado === 'rechazada' || estado === 'prueba_aprobada') {
      return acc
    }
    if (!acc[estado]) {
      acc[estado] = []
    }
    acc[estado].push(idea)
    return acc
  }, {})

  // Manejar inicio de arrastre
  const handleDragStart = (e, formula) => {
    setDraggedFormula(formula)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  // Manejar arrastre sobre una columna
  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  // Manejar salida del arrastre
  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  // Manejar soltar en una columna
  const handleDrop = async (e, targetEstado) => {
    e.preventDefault()
    if (!draggedFormula) return

    // Si el estado es el mismo, no hacer nada
    if ((draggedFormula.estado || '').toLowerCase() === (targetEstado || '').toLowerCase()) {
      setDraggedFormula(null)
      return
    }

    // Definir el orden de los estados (índice más alto = más avanzado)
    const estadosOrden = {
      'generada': 0,
      'en_revision': 1,
      'aprobada': 2,
      'en_prueba': 3,
      'en_produccion': 4
    }

    const estadoActual = (draggedFormula.estado || '').toLowerCase()
    const estadoObjetivo = (targetEstado || '').toLowerCase()

    // Verificar si se está intentando retroceder
    const indiceActual = estadosOrden[estadoActual]
    const indiceObjetivo = estadosOrden[estadoObjetivo]

    if (indiceObjetivo < indiceActual) {
      // No permitir retroceder
      toast.error('No puedes mover una tarjeta hacia atrás en el flujo. Solo puedes avanzar a las siguientes etapas.', {
        duration: 5000,
        icon: '⚠️',
      })
      setDraggedFormula(null)
      setDragOverColumn(null)
      return
    }

    // Si el estado objetivo es en_prueba, mostrar diálogo de analista
    if (targetEstado === 'en_prueba') {
      setSelectedIdea(draggedFormula)
      setSelectedAnalistaId(null)
      if (analistas.length === 0) {
        await loadAnalistas()
      }
      setShowAnalystDialog(true)
      setDraggedFormula(null)
      setDragOverColumn(null)
      return
    }


    // Para otros estados, cambiar directamente
    try {
      const updatedIdea = await ideaService.changeEstado(draggedFormula.id, targetEstado.toLowerCase())
      // Actualizar la idea localmente de forma optimista (sin recargar todo)
      setIdeas(prevIdeas =>
        prevIdeas.map(i =>
          i.id === draggedFormula.id
            ? { ...i, ...updatedIdea, estado: updatedIdea.estado || targetEstado }
            : i
        )
      )
      // Si hay un modal abierto con esta fórmula, actualizarlo también
      if (selectedFormula && selectedFormula.id === draggedFormula.id) {
        setSelectedFormula(prev => prev ? { ...prev, ...updatedIdea, estado: updatedIdea.estado || targetEstado } : null)
      }
      setDraggedFormula(null)
      setDragOverColumn(null)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
      setDraggedFormula(null)
      setDragOverColumn(null)
      // En caso de error, recargar para sincronizar
      loadIdeas()
    }
  }

  // Manejar fin de arrastre
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedFormula(null)
    setDragOverColumn(null)
  }

  const toggleDetails = (ideaId) => {
    const newExpanded = new Set(expandedIdeas)
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId)
    } else {
      newExpanded.add(ideaId)
    }
    setExpandedIdeas(newExpanded)
  }

  const loadPruebasForIdeas = async () => {
    const pruebasMap = new Map()
    for (const idea of ideas) {
      try {
        const pruebas = await pruebaService.getPruebasByIdeaId(idea.id)
        pruebasMap.set(idea.id, pruebas)
      } catch (error) {
        console.error(`Error al cargar pruebas para idea ${idea.id}:`, error)
      }
    }
    setPruebasPorIdea(pruebasMap)
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
      {/* Lista de Ideas */}
      {loadingIdeas ? (
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          <p className="text-text-muted ml-2">Cargando fórmulas...</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 rounded-lg bg-card-dark border border-border-dark">
          <span className="material-symbols-outlined text-6xl text-text-muted mb-4">lightbulb_outline</span>
          <p className="text-text-light text-lg font-semibold mb-2">
            {isAnalista ? 'No tienes fórmulas asignadas' : 'No hay fórmulas registradas'}
          </p>
          <p className="text-text-muted text-sm">
            {isAnalista
              ? 'Las fórmulas asignadas aparecerán aquí cuando te sean asignadas'
              : 'Ve al módulo IA / Simulación para generar nuevas fórmulas desde productos del inventario'}
          </p>
        </div>
      ) : isAnalista ? (
        // Vista de lista para analista
        <div className="space-y-4">
          {ideas.map((formula) => {
            const pruebas = pruebasPorIdea.get(formula.id) || []
            const tienePruebaIniciada = pruebas.length > 0

            return (
              <div
                key={formula.id}
                onClick={() => setSelectedFormula(formula)}
                className="p-6 rounded-lg bg-card-dark border border-border-dark hover:border-primary/50 hover:bg-card-dark/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-text-light font-semibold text-lg">{formula.titulo}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(formula.estado)}`}>
                        {getEstadoLabel(formula.estado)}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">{formula.descripcion}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {formula.categoria && (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-text-muted text-sm">category</span>
                          <span className="text-text-muted text-xs">Categoría:</span>
                          <span className="text-text-light font-medium">{formula.categoria}</span>
                        </div>
                      )}
                      {formula.createdAt && (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-text-muted text-sm">calendar_today</span>
                          <span className="text-text-muted text-xs">Fecha:</span>
                          <span className="text-text-light font-medium">
                            {new Date(formula.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      )}
                      {formula.productoOrigenNombre && (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-text-muted text-sm">inventory_2</span>
                          <span className="text-text-muted text-xs">Producto:</span>
                          <span className="text-text-light font-medium">{formula.productoOrigenNombre}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-text-muted text-sm">science</span>
                        <span className="text-text-muted text-xs">Pruebas:</span>
                        <span className={`font-medium ${tienePruebaIniciada ? 'text-success' : 'text-warning'}`}>
                          {tienePruebaIniciada ? 'Iniciada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="material-symbols-outlined text-text-muted">chevron_right</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Vista kanban para Supervisor QA y Admin
        <div className="overflow-x-auto pb-4 h-full">
          <div className="flex gap-4 min-w-max h-full">
            {kanbanColumns.map((column) => {
              const formulas = formulasByEstado[column.id] || []
              return (
                <div
                  key={column.id}
                  className={`flex-shrink-0 w-80 flex flex-col transition-all ${dragOverColumn === column.id ? 'scale-105' : ''
                    }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    handleDrop(e, column.id)
                    setDragOverColumn(null)
                  }}
                >
                  {/* Header de la columna */}
                  <div className={`mb-4 p-3 rounded-lg border-2 border-dashed ${column.borderClass} ${column.bgClass}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-text-light font-semibold text-sm flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${column.dotClass}`}></span>
                        {column.label}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${column.badgeClass}`}>
                        {formulas.length}
                      </span>
                    </div>
                  </div>

                  {/* Área de drop */}
                  <div className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed p-2 space-y-3 overflow-y-auto transition-all ${dragOverColumn === column.id
                    ? `${column.borderClass} ${column.bgClass} border-solid`
                    : 'bg-input-dark/30 border-border-dark'
                    }`}>
                    {formulas.map((formula) => (
                      <div
                        key={formula.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, formula)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedFormula(formula)}
                        className={`p-4 rounded-lg bg-card-dark border border-border-dark cursor-move hover:border-primary/50 hover:bg-card-dark/80 transition-all ${draggedFormula?.id === formula.id ? 'opacity-50' : ''
                          }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-text-light font-semibold text-sm line-clamp-2 mb-1">
                                {formula.titulo}
                              </h3>
                            </div>
                            <span className="material-symbols-outlined text-text-muted text-sm ml-2">drag_indicator</span>
                          </div>

                          <p className="text-text-muted text-xs mb-3 line-clamp-2">{formula.descripcion}</p>

                          <div className="space-y-1 text-xs text-text-muted">
                            {formula.categoria && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">category</span>
                                <span>{formula.categoria}</span>
                              </div>
                            )}
                            {formula.createdAt && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                <span>{new Date(formula.createdAt).toLocaleDateString('es-ES')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {formulas.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
                        <span>Arrastra fórmulas aquí</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalles de Fórmula */}
      {selectedFormula && (
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
                  {getEstadoLabel(selectedFormula.estado)}
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
                <div className="p-4 rounded-lg bg-card-dark border border-border-dark">
                  {selectedFormula.objetivo && (
                    <div className="mb-3">
                      <p className="text-text-muted text-xs mb-1">Objetivo:</p>
                      <p className="text-text-light text-sm">{selectedFormula.objetivo}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-text-muted text-xs">Estado:</span>
                      <p className="text-text-light font-medium">{selectedFormula.estado || 'N/A'}</p>
                    </div>
                    {selectedFormula.categoria && (
                      <div>
                        <span className="text-text-muted text-xs">Categoría:</span>
                        <p className="text-text-light font-medium">{selectedFormula.categoria}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-muted text-xs">Fecha:</span>
                      <p className="text-text-light font-medium">
                        {selectedFormula.createdAt ? new Date(selectedFormula.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>


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
                        {/* Materiales Seleccionados Automáticamente por la IA */}
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

                        {/* Materiales Sugeridos de Bases de Datos Externas */}
                        {(() => {
                          // Debug: verificar qué hay en materialesSugeridosBD
                          if (aiDetails.materialesSugeridosBD) {
                            console.log('materialesSugeridosBD encontrado:', aiDetails.materialesSugeridosBD)
                            console.log('Tipo:', typeof aiDetails.materialesSugeridosBD)
                            console.log('Es array?', Array.isArray(aiDetails.materialesSugeridosBD))
                            console.log('Longitud:', Array.isArray(aiDetails.materialesSugeridosBD) ? aiDetails.materialesSugeridosBD.length : 'N/A')
                          } else {
                            console.log('materialesSugeridosBD NO encontrado en aiDetails')
                            console.log('Keys disponibles en aiDetails:', Object.keys(aiDetails))
                          }

                          return aiDetails.materialesSugeridosBD && Array.isArray(aiDetails.materialesSugeridosBD) && aiDetails.materialesSugeridosBD.length > 0 ? (
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
                          ) : null
                        })()}

                        {/* Lista de Ingredientes (para fórmulas experimentales) */}
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
                                  {/* Fórmula Molecular */}
                                  {ingrediente.formulaMolecular && (
                                    <div className="mt-2 pt-2 border-t border-border-dark">
                                      <p className="text-text-muted text-xs mb-1">Fórmula Molecular:</p>
                                      <p className="text-text-light text-sm font-mono">{ingrediente.formulaMolecular}</p>
                                      {ingrediente.pesoMolecular && (
                                        <p className="text-text-muted text-xs mt-1">Peso Molecular: {ingrediente.pesoMolecular} g/mol</p>
                                      )}
                                    </div>
                                  )}
                                  {/* Especificaciones Técnicas */}
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
                                  {/* Contenido nutricional del ingrediente */}
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

                        {/* Rendimiento del Batch */}
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

                        {/* Fórmula Química General */}
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

                        {/* Parámetros Fisicoquímicos (para fórmulas experimentales) */}
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

                        {/* Protocolo de Análisis Completo */}
                        {aiDetails.protocoloAnalisis && (
                          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">biotech</span>
                              Protocolo de Análisis Completo
                            </h4>
                            <div className="space-y-4">
                              {/* Pruebas Físicas */}
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
                              {/* Pruebas Químicas */}
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
                              {/* Pruebas Microbiológicas */}
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
                              {/* Directrices para el Analista */}
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
                                        <p className="text-text-light whitespace-pre-line">{aiDetails.protocoloAnalisis.directricesAnalista.preparacionMuestras.replace(/\\n/g, '\n')}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.calibracionEquipos && (
                                      <div>
                                        <span className="text-text-muted text-xs">Calibración de Equipos:</span>
                                        <p className="text-text-light whitespace-pre-line">{aiDetails.protocoloAnalisis.directricesAnalista.calibracionEquipos.replace(/\\n/g, '\n')}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.controlCalidad && (
                                      <div>
                                        <span className="text-text-muted text-xs">Control de Calidad:</span>
                                        <p className="text-text-light whitespace-pre-line">{aiDetails.protocoloAnalisis.directricesAnalista.controlCalidad.replace(/\\n/g, '\n')}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.interpretacionResultados && (
                                      <div>
                                        <span className="text-text-muted text-xs">Interpretación de Resultados:</span>
                                        <p className="text-text-light whitespace-pre-line">{aiDetails.protocoloAnalisis.directricesAnalista.interpretacionResultados.replace(/\\n/g, '\n')}</p>
                                      </div>
                                    )}
                                    {aiDetails.protocoloAnalisis.directricesAnalista.documentacion && (
                                      <div>
                                        <span className="text-text-muted text-xs">Documentación:</span>
                                        <p className="text-text-light whitespace-pre-line">{aiDetails.protocoloAnalisis.directricesAnalista.documentacion.replace(/\\n/g, '\n')}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Botón Iniciar Prueba para Analistas */}
                              {isAnalista && (selectedFormula.estado || '').toLowerCase() === 'en_prueba' && (() => {
                                // Verificar si ya existe una prueba para esta fórmula
                                const pruebasExistentes = pruebasPorIdea.get(selectedFormula.id) || []
                                const tienePruebaIniciada = pruebasExistentes.length > 0

                                return !tienePruebaIniciada ? (
                                  <div className="mt-4 pt-4 border-t border-rose-500/20">
                                    <button
                                      onClick={async () => {
                                        try {
                                          // Obtener el protocolo de análisis completo de los detalles de IA
                                          const aiDetails = parseAIDetails(selectedFormula.detallesIA)
                                          let pruebasTexto = ''

                                          if (aiDetails && aiDetails.protocoloAnalisis) {
                                            // Construir texto detallado del protocolo de análisis
                                            const protocolo = aiDetails.protocoloAnalisis
                                            const lineas = []

                                            // Pruebas Físicas
                                            if (protocolo.pruebasFisicas) {
                                              lineas.push('PRUEBAS FÍSICAS:')
                                              if (protocolo.pruebasFisicas.apariencia) lineas.push(`- Apariencia: ${protocolo.pruebasFisicas.apariencia}`)
                                              if (protocolo.pruebasFisicas.olor) lineas.push(`- Olor: ${protocolo.pruebasFisicas.olor}`)
                                              if (protocolo.pruebasFisicas.solubilidad) lineas.push(`- Solubilidad: ${protocolo.pruebasFisicas.solubilidad}`)
                                              if (protocolo.pruebasFisicas.humedad) lineas.push(`- Humedad: ${protocolo.pruebasFisicas.humedad}`)
                                              if (protocolo.pruebasFisicas.densidadAparente) lineas.push(`- Densidad Aparente: ${protocolo.pruebasFisicas.densidadAparente}`)
                                              lineas.push('')
                                            }

                                            // Pruebas Químicas
                                            if (protocolo.pruebasQuimicas) {
                                              lineas.push('PRUEBAS QUÍMICAS:')
                                              if (protocolo.pruebasQuimicas.proteina) lineas.push(`- Proteína: ${protocolo.pruebasQuimicas.proteina}`)
                                              if (protocolo.pruebasQuimicas.grasa) lineas.push(`- Grasa: ${protocolo.pruebasQuimicas.grasa}`)
                                              if (protocolo.pruebasQuimicas.carbohidratos) lineas.push(`- Carbohidratos: ${protocolo.pruebasQuimicas.carbohidratos}`)
                                              if (protocolo.pruebasQuimicas.creatina) lineas.push(`- Creatina: ${protocolo.pruebasQuimicas.creatina}`)
                                              if (protocolo.pruebasQuimicas.perfilAminoacidos) lineas.push(`- Perfil de Aminoácidos: ${protocolo.pruebasQuimicas.perfilAminoacidos}`)
                                              if (protocolo.pruebasQuimicas.metalesPesados) lineas.push(`- Metales Pesados: ${protocolo.pruebasQuimicas.metalesPesados}`)
                                              if (protocolo.pruebasQuimicas.pH) lineas.push(`- pH: ${protocolo.pruebasQuimicas.pH}`)
                                              if (protocolo.pruebasQuimicas.cenizas) lineas.push(`- Cenizas: ${protocolo.pruebasQuimicas.cenizas}`)
                                              lineas.push('')
                                            }

                                            // Pruebas Microbiológicas
                                            if (protocolo.pruebasMicrobiologicas) {
                                              lineas.push('PRUEBAS MICROBIOLÓGICAS:')
                                              if (protocolo.pruebasMicrobiologicas.bacteriasAerobias) lineas.push(`- Bacterias Aerobias: ${protocolo.pruebasMicrobiologicas.bacteriasAerobias}`)
                                              if (protocolo.pruebasMicrobiologicas.mohosLevaduras) lineas.push(`- Mohos y Levaduras: ${protocolo.pruebasMicrobiologicas.mohosLevaduras}`)
                                              if (protocolo.pruebasMicrobiologicas.eColi) lineas.push(`- E. coli: ${protocolo.pruebasMicrobiologicas.eColi}`)
                                              if (protocolo.pruebasMicrobiologicas.salmonella) lineas.push(`- Salmonella: ${protocolo.pruebasMicrobiologicas.salmonella}`)
                                              if (protocolo.pruebasMicrobiologicas.coliformes) lineas.push(`- Coliformes: ${protocolo.pruebasMicrobiologicas.coliformes}`)
                                              lineas.push('')
                                            }

                                            // Directrices para el Analista
                                            if (protocolo.directricesAnalista) {
                                              lineas.push('DIRECTRICES PARA EL ANALISTA:')
                                              if (protocolo.directricesAnalista.preparacionMuestras) {
                                                lineas.push('Preparación de Muestras:')
                                                lineas.push(protocolo.directricesAnalista.preparacionMuestras.replace(/\\n/g, '\n'))
                                                lineas.push('')
                                              }
                                              if (protocolo.directricesAnalista.calibracionEquipos) {
                                                lineas.push('Calibración de Equipos:')
                                                lineas.push(protocolo.directricesAnalista.calibracionEquipos.replace(/\\n/g, '\n'))
                                                lineas.push('')
                                              }
                                              if (protocolo.directricesAnalista.controlCalidad) {
                                                lineas.push('Control de Calidad:')
                                                lineas.push(protocolo.directricesAnalista.controlCalidad.replace(/\\n/g, '\n'))
                                                lineas.push('')
                                              }
                                              if (protocolo.directricesAnalista.interpretacionResultados) {
                                                lineas.push('Interpretación de Resultados:')
                                                lineas.push(protocolo.directricesAnalista.interpretacionResultados.replace(/\\n/g, '\n'))
                                                lineas.push('')
                                              }
                                              if (protocolo.directricesAnalista.documentacion) {
                                                lineas.push('Documentación:')
                                                lineas.push(protocolo.directricesAnalista.documentacion.replace(/\\n/g, '\n'))
                                              }
                                            }

                                            pruebasTexto = lineas.join('\n')
                                          } else if (selectedFormula.pruebasRequeridas) {
                                            // Fallback a pruebas requeridas si no hay protocolo
                                            pruebasTexto = selectedFormula.pruebasRequeridas
                                          } else {
                                            pruebasTexto = 'Protocolo de análisis no disponible. Revisar detalles de IA.'
                                          }

                                          // Crear prueba automáticamente con los datos de la idea
                                          const codigoMuestra = `MU-${selectedFormula.id}-${Date.now()}`
                                          const nuevaPrueba = await pruebaService.createPrueba({
                                            ideaId: selectedFormula.id,
                                            codigoMuestra: codigoMuestra,
                                            tipoPrueba: 'Control de Calidad - Fórmula IA',
                                            descripcion: `Prueba generada automáticamente para validar la fórmula: ${selectedFormula.titulo}`,
                                            pruebasRequeridas: pruebasTexto,
                                            estado: 'pendiente'
                                          })

                                          // Recargar pruebas
                                          loadPruebasForIdeas()

                                          // Redirigir a Pruebas con la prueba seleccionada
                                          navigate(`/pruebas?pruebaId=${nuevaPrueba.id}`)
                                        } catch (error) {
                                          console.error('Error al crear prueba:', error)
                                          toast.error('Error al crear prueba: ' + (error.message || 'Error desconocido'))
                                        }
                                      }}
                                      className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                                      Iniciar Prueba
                                    </button>
                                    <p className="text-text-muted text-xs mt-2 text-center">
                                      Se creará una prueba con el protocolo de análisis completo y serás redirigido al módulo de Control de Calidad
                                    </p>
                                  </div>
                                ) : (
                                  <div className="mt-4 pt-4 border-t border-rose-500/20">
                                    <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                                      <p className="text-text-light text-sm font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Prueba iniciada
                                      </p>
                                      <p className="text-text-muted text-xs mt-1">
                                        Ya existe una prueba para esta idea. Puedes verla en el módulo de Pruebas / Control de Calidad.
                                      </p>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Recomendaciones Adicionales */}
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
                                    {item.disponibleEnInventario !== undefined && (
                                      <div>
                                        <span className="text-text-muted">Disponible:</span>
                                        <p className={`font-medium ${item.disponibleEnInventario ? 'text-green-400' : 'text-red-400'}`}>
                                          {item.disponibleEnInventario ? 'Sí' : 'No'}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {item.razon && (
                                    <p className="text-text-muted text-xs mt-2 italic">Razón: {item.razon}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Escenarios Positivos */}
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

                        {/* Escenarios Negativos */}
                        {aiDetails.escenariosNegativos && Array.isArray(aiDetails.escenariosNegativos) && aiDetails.escenariosNegativos.length > 0 && (
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              Escenarios Negativos / Consideraciones
                            </h4>
                            <ul className="space-y-2">
                              {aiDetails.escenariosNegativos.map((escenario, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-text-light text-sm">
                                  <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">info</span>
                                  <span>{escenario}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Verificación de Inventario */}
                        {aiDetails.verificacionInventario && (
                          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">inventory_2</span>
                              Verificación de Inventario
                            </h4>
                            <p className="text-text-light text-sm leading-relaxed">{aiDetails.verificacionInventario}</p>
                          </div>
                        )}

                        {/* Materiales Eliminados */}
                        {aiDetails.materialesEliminados && Array.isArray(aiDetails.materialesEliminados) && aiDetails.materialesEliminados.length > 0 && (
                          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">remove_circle</span>
                              Materiales Eliminados
                            </h4>
                            <ul className="space-y-2">
                              {aiDetails.materialesEliminados.map((material, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-text-light text-sm">
                                  <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">remove</span>
                                  <span>{material}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Pruebas Asociadas */}
              {pruebasPorIdea.has(selectedFormula.id) && pruebasPorIdea.get(selectedFormula.id).length > 0 && (
                <div>
                  <h3 className="text-text-light font-semibold text-lg mb-3">Pruebas de Laboratorio</h3>
                  <div className="space-y-2">
                    {pruebasPorIdea.get(selectedFormula.id).map((prueba) => (
                      <div key={prueba.id} className="p-3 rounded-lg bg-input-dark border border-border-dark">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-text-light font-medium text-sm">{prueba.codigoMuestra}</p>
                            <p className="text-text-muted text-xs">{prueba.tipoPrueba}</p>
                            {prueba.fechaMuestreo && (
                              <p className="text-text-muted text-xs mt-1">
                                Muestreo: {new Date(prueba.fechaMuestreo).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${(prueba.estado || '').toLowerCase() === 'pendiente' ? 'bg-warning/20 text-warning' :
                            (prueba.estado || '').toLowerCase() === 'en_proceso' ? 'bg-primary/20 text-primary' :
                              (prueba.estado || '').toLowerCase() === 'completada' ? 'bg-success/20 text-success' :
                                (prueba.estado || '').toLowerCase() === 'oos' ? 'bg-danger/20 text-danger' :
                                  'bg-gray-500/20 text-gray-400'
                            }`}>
                            {(prueba.estado || '').toLowerCase() === 'pendiente' ? 'Pendiente' :
                              (prueba.estado || '').toLowerCase() === 'en_proceso' ? 'En Proceso' :
                                (prueba.estado || '').toLowerCase() === 'completada' ? 'Completada' :
                                  (prueba.estado || '').toLowerCase() === 'oos' ? 'OOS' :
                                    (prueba.estado || '').toLowerCase() === 'rechazada' ? 'Rechazada' : prueba.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones según estado y rol */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border-dark">
                {/* Acciones para Supervisor QA y Admin */}
                {!isAnalista && (
                  <>
                    {(selectedFormula.estado || '').toLowerCase() === 'generada' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChangeEstado(selectedFormula, 'en_revision')
                            setSelectedFormula(null)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/30"
                        >
                          Enviar a Revisión
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChangeEstado(selectedFormula, 'rechazada')
                            setSelectedFormula(null)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">archive</span>
                          Archivar
                        </button>
                      </>
                    )}
                    {(selectedFormula.estado || '').toLowerCase() === 'en_revision' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChangeEstado(selectedFormula, 'aprobada')
                            setSelectedFormula(null)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          Aprobar para Pruebas
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChangeEstado(selectedFormula, 'rechazada')
                            setSelectedFormula(null)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">archive</span>
                          Archivar
                        </button>
                      </>
                    )}
                    {(selectedFormula.estado || '').toLowerCase() === 'aprobada' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChangeEstado(selectedFormula, 'en_prueba')
                          setSelectedFormula(null)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">science</span>
                        Enviar a Pruebas
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de selección de analista */}
      {showAnalystDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnalystDialog(false)
              setSelectedIdea(null)
              setSelectedAnalistaId(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-md w-full shadow-xl">
            <div className="p-6">
              {/* Título */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/20">
                  <span className="material-symbols-outlined text-2xl text-purple-400">science</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-text-light text-lg font-semibold mb-1">
                    Asignar Analista
                  </h3>
                  <p className="text-text-muted text-sm">
                    Selecciona el analista de laboratorio que realizará las pruebas de esta idea.
                  </p>
                </div>
              </div>

              {/* Lista de analistas */}
              <div className="mb-4">
                {loadingAnalistas ? (
                  <div className="text-center py-4">
                    <p className="text-text-muted text-sm">Cargando analistas...</p>
                  </div>
                ) : analistas.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-text-muted text-sm">No hay analistas disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analistas.map((analista) => (
                      <label
                        key={analista.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAnalistaId === analista.id
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-input-dark border-border-dark hover:bg-border-dark'
                          }`}
                      >
                        <input
                          type="radio"
                          name="analista"
                          value={analista.id}
                          checked={selectedAnalistaId === analista.id}
                          onChange={(e) => setSelectedAnalistaId(parseInt(e.target.value))}
                          className="w-4 h-4 text-purple-500"
                        />
                        <div className="flex-1">
                          <p className="text-text-light font-medium">{analista.nombre}</p>
                          <p className="text-text-muted text-xs">{analista.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowAnalystDialog(false)
                    setSelectedIdea(null)
                    setSelectedAnalistaId(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignToAnalyst}
                  disabled={!selectedAnalistaId || loadingAnalistas}
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Asignar y Enviar a Pruebas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Ideas

