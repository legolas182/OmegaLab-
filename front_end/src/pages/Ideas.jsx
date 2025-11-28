import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import ideaService from '../services/ideaService'
import pruebaService from '../services/pruebaService'
import chemicalDatabaseService from '../services/chemicalDatabaseService'

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
        // Filtrar solo ideas en estado EN_PRUEBA (las PRUEBA_APROBADA van al historial)
        const ideasEnPrueba = data.filter(idea => idea.estado === 'EN_PRUEBA')
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
      alert('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
      // En caso de error, recargar para sincronizar
      loadIdeas()
    }
  }

  const handleAssignToAnalyst = async () => {
    if (!selectedAnalistaId) {
      alert('Por favor selecciona un analista')
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
      alert('Error al asignar analista: ' + (error.message || 'Error desconocido'))
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

  // Definir columnas del kanban (sin incluir RECHAZADA - las fórmulas rechazadas se archivan)
  const kanbanColumns = [
    { id: 'GENERADA', label: 'Generada', borderClass: 'border-blue-500/30', bgClass: 'bg-blue-500/10', dotClass: 'bg-blue-500', badgeClass: 'bg-blue-500/20 text-blue-400' },
    { id: 'EN_REVISION', label: 'En Revisión', borderClass: 'border-yellow-500/30', bgClass: 'bg-yellow-500/10', dotClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'APROBADA', label: 'Aprobada', borderClass: 'border-green-500/30', bgClass: 'bg-green-500/10', dotClass: 'bg-green-500', badgeClass: 'bg-green-500/20 text-green-400' },
    { id: 'EN_PRUEBA', label: 'En Prueba', borderClass: 'border-purple-500/30', bgClass: 'bg-purple-500/10', dotClass: 'bg-purple-500', badgeClass: 'bg-purple-500/20 text-purple-400' },
    { id: 'PRUEBA_APROBADA', label: 'Aprobación Final', borderClass: 'border-emerald-500/30', bgClass: 'bg-emerald-500/10', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'EN_PRODUCCION', label: 'En Producción', borderClass: 'border-indigo-500/30', bgClass: 'bg-indigo-500/10', dotClass: 'bg-indigo-500', badgeClass: 'bg-indigo-500/20 text-indigo-400' }
  ]

  // Agrupar fórmulas por estado (excluyendo RECHAZADA del kanban - se archivan)
  const formulasByEstado = ideas.reduce((acc, idea) => {
    const estado = idea.estado || 'GENERADA'
    // Las fórmulas rechazadas no aparecen en el kanban, se archivan
    if (estado === 'RECHAZADA') {
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
    if (draggedFormula.estado === targetEstado) {
      setDraggedFormula(null)
      return
    }

    // Si el estado objetivo es EN_PRUEBA, mostrar diálogo de analista
    if (targetEstado === 'EN_PRUEBA') {
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
      alert('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
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

  // Estados para búsqueda en BD químicas
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('NAME')
  const [searchSource, setSearchSource] = useState('all')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchDatabases = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      let searchResults = []
      
      if (searchSource === 'all') {
        const allResults = await chemicalDatabaseService.searchAll(searchQuery, searchType)
        searchResults = Object.values(allResults).flat()
      } else if (searchSource === 'PubChem') {
        searchResults = await chemicalDatabaseService.searchPubChem(searchQuery, searchType)
      } else if (searchSource === 'ChEMBL') {
        searchResults = await chemicalDatabaseService.searchChEMBL(searchQuery, searchType)
      }
      
      setResults(searchResults)
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full">
      {/* Búsqueda en Bases de Datos Químicas */}
      <div className="rounded-lg bg-card-dark border border-border-dark p-6 mb-6">
        <h2 className="text-text-light text-xl font-semibold mb-4">Búsqueda en Bases de Datos Moleculares</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex gap-2">
            {['PubChem', 'ChEMBL', 'all'].map((source) => (
              <button
                key={source}
                onClick={() => setSearchSource(source)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  searchSource === source
                    ? 'bg-primary text-white'
                    : 'bg-input-dark text-text-light hover:bg-border-dark'
                }`}
              >
                {source === 'all' ? 'Todas' : source}
              </button>
            ))}
          </div>

          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
          >
            <option value="NAME">Por Nombre</option>
            <option value="FORMULA">Por Fórmula Molecular</option>
            <option value="SMILES">Por SMILES</option>
            <option value="CAS">Por Número CAS</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchDatabases()}
            placeholder="Buscar en PubChem, ChEMBL, DrugBank, ZINC..."
            className="flex-1 h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />

          <button
            onClick={searchDatabases}
            disabled={loading}
            className="h-12 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-text-light font-semibold">Resultados ({results.length})</h3>
            {results.map((result, index) => (
              <div key={result.id || index} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-text-light font-semibold">{result.name}</h4>
                    {result.formula && (
                      <p className="text-text-muted text-sm">Fórmula: {result.formula}</p>
                    )}
                    {result.molecularWeight && (
                      <p className="text-text-muted text-sm">Peso Molecular: {result.molecularWeight} g/mol</p>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">{result.source}</span>
                </div>
                {result.logP !== null && result.logP !== undefined && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-text-muted text-xs mb-1">LogP</p>
                      <p className="text-text-light">{result.logP}</p>
                    </div>
                    {result.solubility && (
                      <div>
                        <p className="text-text-muted text-xs mb-1">Solubilidad</p>
                        <p className="text-text-light">{result.solubility}</p>
                      </div>
                    )}
                    {result.bioactivity && (
                      <div>
                        <p className="text-text-muted text-xs mb-1">Bioactividad</p>
                        <p className="text-text-light">{result.bioactivity}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
                  className={`flex-shrink-0 w-80 flex flex-col transition-all ${
                    dragOverColumn === column.id ? 'scale-105' : ''
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
                  <div className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed p-2 space-y-3 overflow-y-auto transition-all ${
                    dragOverColumn === column.id 
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
                        className={`p-4 rounded-lg bg-card-dark border border-border-dark cursor-move hover:border-primary/50 hover:bg-card-dark/80 transition-all ${
                          draggedFormula?.id === formula.id ? 'opacity-50' : ''
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
                    {selectedFormula.approvedByName && (
                      <div>
                        <span className="text-text-muted text-xs">Aprobado por:</span>
                        <p className="text-text-light font-medium">{selectedFormula.approvedByName}</p>
                      </div>
                    )}
                  </div>
        </div>
      </div>

              {/* Pruebas Requeridas */}
              {selectedFormula.pruebasRequeridas && (() => {
                // Procesar el texto de pruebas requeridas
                let pruebasText = selectedFormula.pruebasRequeridas;
                
                // Reemplazar \n literales y saltos de línea reales
                pruebasText = pruebasText.replace(/\\n/g, '\n');
                
                // Dividir por líneas y limpiar
                const lineas = pruebasText
                  .split('\n')
                  .map(linea => linea.trim())
                  .filter(linea => linea.length > 0);
                
                return (
                  <div className="mt-4 pt-4 border-t border-border-dark">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-text-light font-semibold mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">assignment</span>
                            Pruebas Requeridas (Generadas por IA)
                          </h4>
                          <p className="text-text-muted text-xs mb-3">
                            Lista de pruebas de laboratorio que deben realizarse para validar esta fórmula:
                          </p>
                          <div className="bg-card-dark p-3 rounded-lg border border-border-dark">
                            <ul className="space-y-2 text-text-light text-sm leading-relaxed">
                              {lineas.map((linea, idx) => {
                                // Si la línea ya empieza con "- " o "• ", mantenerla
                                // Si no, agregar bullet
                                const textoLimpio = linea.startsWith('- ') || linea.startsWith('• ') 
                                  ? linea.substring(2) 
                                  : linea;
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{textoLimpio}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {isAnalista && selectedFormula.estado === 'EN_PRUEBA' && (() => {
                      // Verificar si ya existe una prueba para esta fórmula
                      const pruebasExistentes = pruebasPorIdea.get(selectedFormula.id) || []
                      const tienePruebaIniciada = pruebasExistentes.length > 0
                      
                      return !tienePruebaIniciada ? (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <button
                            onClick={async () => {
                              try {
                                // Crear prueba automáticamente con los datos de la idea
                                const codigoMuestra = `MU-${selectedFormula.id}-${Date.now()}`
                                const nuevaPrueba = await pruebaService.createPrueba({
                                  ideaId: selectedFormula.id,
                                  codigoMuestra: codigoMuestra,
                                  tipoPrueba: 'Control de Calidad - Fórmula IA',
                                  descripcion: `Prueba generada automáticamente para validar la fórmula: ${selectedFormula.titulo}`,
                                  pruebasRequeridas: selectedFormula.pruebasRequeridas,
                                  estado: 'PENDIENTE'
                                })
                                
                                // Recargar pruebas
                                loadPruebasForIdeas()
                                
                                // Redirigir a Pruebas con la prueba seleccionada
                                navigate(`/pruebas?pruebaId=${nuevaPrueba.id}`)
                              } catch (error) {
                                console.error('Error al crear prueba:', error)
                                alert('Error al crear prueba: ' + (error.message || 'Error desconocido'))
                              }
                            }}
                            className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                            Iniciar Prueba
                          </button>
                          <p className="text-text-muted text-xs mt-2 text-center">
                            Se creará una prueba con estos parámetros y serás redirigido al módulo de Control de Calidad
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-primary/20">
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
                );
              })()}

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

                        {/* Perfil Nutricional */}
                        {aiDetails.perfilNutricional && (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">nutrition</span>
                              Perfil Nutricional
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Por 100g */}
                              {aiDetails.perfilNutricional.por100g && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">Por 100g</h5>
                                  <div className="space-y-1 text-sm">
                                    {aiDetails.perfilNutricional.por100g.proteina !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Proteína:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.por100g.proteina} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.por100g.carbohidratos !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Carbohidratos:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.por100g.carbohidratos} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.por100g.grasas !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Grasas:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.por100g.grasas} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.por100g.calorias !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Calorías:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.por100g.calorias} kcal</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Por Ración */}
                              {aiDetails.perfilNutricional.porRacion && (
                                <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                                  <h5 className="text-text-light font-medium mb-2">
                                    Por Ración ({aiDetails.perfilNutricional.porRacion.tamanoRacion || 'N/A'} {aiDetails.perfilNutricional.porRacion.unidad || 'g'})
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    {aiDetails.perfilNutricional.porRacion.proteina !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Proteína:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.porRacion.proteina} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.porRacion.carbohidratos !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Carbohidratos:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.porRacion.carbohidratos} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.porRacion.grasas !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Grasas:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.porRacion.grasas} g</span>
                                      </div>
                                    )}
                                    {aiDetails.perfilNutricional.porRacion.calorias !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">Calorías:</span>
                                        <span className="text-text-light font-medium">{aiDetails.perfilNutricional.porRacion.calorias} kcal</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Cálculos Nutricionales */}
                        {aiDetails.calculosNutricionales && (
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">calculate</span>
                              Cálculos Nutricionales Detallados
                            </h4>
                            <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                              <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                                {aiDetails.calculosNutricionales.replace(/\\n/g, '\n')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Proceso de Fabricación */}
                        {aiDetails.procesoFabricacion && (
                          <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                              Proceso de Fabricación
                            </h4>
                            <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                              <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                                {aiDetails.procesoFabricacion.replace(/\\n/g, '\n')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Buenas Prácticas */}
                        {aiDetails.buenasPracticas && (
                          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              Buenas Prácticas, Seguridad y Regulación
                            </h4>
                            <div className="p-3 rounded-lg bg-card-dark border border-border-dark">
                              <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                                {aiDetails.buenasPracticas.replace(/\\n/g, '\n')}
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

                        {/* Justificación (para fórmulas experimentales) */}
                        {aiDetails.justificacion && (
                          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">description</span>
                              Justificación Técnica
                            </h4>
                            <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">
                              {aiDetails.justificacion.replace(/\\n/g, '\n')}
                            </p>
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

                        {/* Materiales Nuevos - Siempre visible */}
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <h4 className="text-text-light font-semibold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Materiales Nuevos Agregados
                          </h4>
                          {aiDetails.materialesNuevos && Array.isArray(aiDetails.materialesNuevos) && aiDetails.materialesNuevos.length > 0 ? (
                            <ul className="space-y-2">
                              {aiDetails.materialesNuevos.map((material, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-text-light text-sm">
                                  <span className="material-symbols-outlined text-emerald-400 text-sm mt-0.5">add</span>
                                  <span>{material}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-text-muted text-sm italic">No se agregaron materiales nuevos a esta fórmula.</p>
                          )}
                        </div>

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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prueba.estado === 'PENDIENTE' ? 'bg-warning/20 text-warning' :
                            prueba.estado === 'EN_PROCESO' ? 'bg-primary/20 text-primary' :
                            prueba.estado === 'COMPLETADA' ? 'bg-success/20 text-success' :
                            prueba.estado === 'OOS' ? 'bg-danger/20 text-danger' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {prueba.estado === 'PENDIENTE' ? 'Pendiente' :
                             prueba.estado === 'EN_PROCESO' ? 'En Proceso' :
                             prueba.estado === 'COMPLETADA' ? 'Completada' :
                             prueba.estado === 'OOS' ? 'OOS' :
                             prueba.estado === 'RECHAZADA' ? 'Rechazada' : prueba.estado}
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
                    {selectedFormula.estado === 'GENERADA' && (
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
                    {selectedFormula.estado === 'EN_REVISION' && (
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
                    {selectedFormula.estado === 'APROBADA' && (
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
                    {selectedFormula.estado === 'PRUEBA_APROBADA' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChangeEstado(selectedFormula, 'en_produccion')
                          setSelectedFormula(null)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">precision_manufacturing</span>
                        Enviar a Producción
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
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAnalistaId === analista.id
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

