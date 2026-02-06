import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import materialService from '../services/materialService'
import ideaService from '../services/ideaService'
import chemicalDatabaseService from '../services/chemicalDatabaseService'

const IA = () => {
  const { user } = useAuth()
  
  // Estados para crear desde materias primas
  const [materials, setMaterials] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedCompounds, setSelectedCompounds] = useState([])
  const [objetivo, setObjetivo] = useState('')
  const [rendimiento, setRendimiento] = useState(100)
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [materialSearchTerm, setMaterialSearchTerm] = useState('')
  const [materialFilterTipo, setMaterialFilterTipo] = useState('')
  
  // Estados para búsqueda en BD químicas
  const [showChemicalSearch, setShowChemicalSearch] = useState(false) // Para pestaña dentro del modal
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('NAME')
  const [searchSource, setSearchSource] = useState('PubChem')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedCompound, setSelectedCompound] = useState(null)
  
  // Estados generales
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Verificar permisos
  if (!user || (!hasAnyRole(user, 'SUPERVISOR_QA') && !hasAnyRole(user, 'ADMINISTRADOR'))) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">Solo Supervisor QA y Administrador pueden acceder a IA / Simulación</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      const data = await materialService.getMaterials({})
      setMaterials(data || [])
    } catch (error) {
      console.error('Error cargando materias primas:', error)
    }
  }


  const handleSearchChemical = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      let results = []
      
      if (searchSource === 'all') {
        const allResults = await chemicalDatabaseService.searchAll(searchQuery, searchType)
        results = Object.values(allResults).flat()
      } else if (searchSource === 'PubChem') {
        results = await chemicalDatabaseService.searchPubChem(searchQuery, searchType)
      } else if (searchSource === 'ChEMBL') {
        results = await chemicalDatabaseService.searchChEMBL(searchQuery, searchType)
      }
      
      setSearchResults(results)
    } catch (error) {
      console.error('Error buscando en BD químicas:', error)
      setMessage({ type: 'error', text: 'Error al buscar en bases de datos químicas' })
    } finally {
      setSearching(false)
    }
  }

  const handleAddCompound = (compound) => {
    if (!selectedCompounds.find(c => c.id === compound.id)) {
      setSelectedCompounds([...selectedCompounds, compound])
      setMessage({ type: 'success', text: `${compound.name} agregado a la fórmula` })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleMaterial = (materialId) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId)
      } else {
        return [...prev, materialId]
      }
    })
  }

  // Filtrar materias primas según búsqueda y filtros
  const filteredMaterials = materials.filter(m => {
    if (!m) return false
    const matchesSearch = !materialSearchTerm || 
      (m.nombre && m.nombre.toLowerCase().includes(materialSearchTerm.toLowerCase())) ||
      (m.codigo && m.codigo.toLowerCase().includes(materialSearchTerm.toLowerCase()))
    const matchesFilter = !materialFilterTipo || m.tipo === materialFilterTipo
    return matchesSearch && matchesFilter
  })

  const handleGenerateFormula = async () => {
    // Ya no requerimos que seleccionen materiales - la IA los seleccionará automáticamente
    if (!objetivo.trim()) {
      setMessage({ type: 'error', text: 'Debes especificar el objetivo de la fórmula' })
      return
    }

    setGenerating(true)
    setMessage({ type: '', text: '' })

    try {
      // Si hay materiales seleccionados manualmente, los enviamos
      // Si no hay ninguno, enviamos array vacío y la IA seleccionará automáticamente
      const materialIdsToSend = selectedMaterials.length > 0 ? selectedMaterials : []
      
      // Filtrar compuestos que tienen ID (los de BD químicas pueden no tener ID hasta que se guarden)
      const compoundIds = selectedCompounds
        .map(c => c.id)
        .filter(id => id != null)
      
      const idea = await ideaService.generateFromMaterials(objetivo, materialIdsToSend, compoundIds)
      setMessage({ type: 'success', text: 'Fórmula generada exitosamente. La IA ha seleccionado automáticamente las materias primas del inventario. Revisa el módulo de Ideas para ver los detalles completos.' })
    
      // Disparar evento para recargar ideas en el kanban
      window.dispatchEvent(new CustomEvent('ideaCreated', {
        detail: { ideaId: idea.id }
      }))
    
      // Limpiar formulario
      setSelectedMaterials([])
      setSelectedCompounds([])
      setObjetivo('')
      setRendimiento(100)
    } catch (error) {
      console.error('Error generando fórmula:', error)
      setMessage({ type: 'error', text: error.message || 'Error al generar fórmula' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full h-full">
      {/* Mensaje */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg alert-message ${
          message.type === 'success' 
            ? 'alert-success bg-green-500/20 border border-green-500/50 text-green-400' 
            : 'alert-error bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Formulación Experimental */}
      <div className="space-y-6">
          {/* Información de la Fórmula */}
          <div className="rounded-lg bg-card-dark border border-border-dark p-6">
            <h2 className="text-text-light text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">science</span>
              Formulación Experimental
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">
                  Nombre de la Fórmula
                </label>
                <input
                  type="text"
                  placeholder="Ej: Proteína Masa Muscular"
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-light text-sm font-medium mb-2">
                  Objetivo de la Fórmula
                </label>
                <textarea
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={3}
                  placeholder="Ej: Proteína en polvo para ganar masa muscular con alto contenido proteico (≥80%) y buena solubilidad"
                  className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">
                    Rendimiento (g)
                  </label>
                  <input
                    type="number"
                    value={rendimiento}
                    onChange={(e) => setRendimiento(parseFloat(e.target.value) || 100)}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Botón Generar */}
          <button
            onClick={handleGenerateFormula}
            disabled={generating || !objetivo.trim()}
            className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Analizando inventario y generando fórmula con IA...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">psychology</span>
                Generar Fórmula Experimental con IA
              </>
            )}
          </button>
          
          {/* Información adicional */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-400 text-xl">info</span>
              <div className="flex-1">
                <p className="text-text-light text-lg font-medium mb-2">¿Cómo funciona la selección automática?</p>
                <ul className="text-text-muted text-base space-y-2 list-disc list-inside">
                  <li>La IA analiza el inventario completo de materias primas</li>
                  <li>Selecciona automáticamente las más adecuadas para tu objetivo</li>
                  <li>Sugiere nuevos compuestos de bases de datos externas si son necesarios</li>
                  <li>Muestra una justificación detallada de cada selección</li>
                  <li>Puedes revisar y modificar las selecciones en el módulo de Ideas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      {/* Modal de Selección de Materias Primas e Inventario */}
      {showMaterialSelector && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMaterialSelector(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 flex items-center justify-between z-10">
              <h2 className="text-text-light text-2xl font-bold">Seleccionar Materias Primas</h2>
              <button
                onClick={() => setShowMaterialSelector(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark"
              >
                <span className="material-symbols-outlined">close</span>
          </button>
        </div>

            <div className="p-6">
              {/* Pestañas */}
              <div className="flex gap-2 mb-6 border-b border-border-dark">
                <button
                  onClick={() => setShowChemicalSearch(false)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    !showChemicalSearch
                      ? 'bg-primary text-white'
                      : 'bg-input-dark text-text-light hover:bg-border-dark'
                  }`}
                >
                  <span className="material-symbols-outlined align-middle mr-2 text-sm">inventory_2</span>
                  Inventario
                </button>
                <button
                  onClick={() => setShowChemicalSearch(true)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    showChemicalSearch
                      ? 'bg-primary text-white'
                      : 'bg-input-dark text-text-light hover:bg-border-dark'
                  }`}
                >
                  <span className="material-symbols-outlined align-middle mr-2 text-sm">science</span>
                  Bases de Datos Químicas
          </button>
        </div>

              {!showChemicalSearch ? (
                /* Pestaña: Inventario */
              <div>
                  {/* Búsqueda y Filtros */}
                  <div className="mb-4 space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={materialSearchTerm}
                        onChange={(e) => setMaterialSearchTerm(e.target.value)}
                        placeholder="Buscar materia prima..."
                        className="flex-1 h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                      />
                      <select
                        value={materialFilterTipo}
                        onChange={(e) => setMaterialFilterTipo(e.target.value)}
                        className="h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="MATERIA_PRIMA">Materia Prima</option>
                        <option value="EXCIPIENTE">Excipiente</option>
                        <option value="SABORIZANTE">Saborizante</option>
                        <option value="ENDULZANTE">Endulzante</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-text-muted">
                        {filteredMaterials.length} materias primas disponibles
                      </p>
                      <p className="text-primary font-medium">
                        {selectedMaterials.length} seleccionada{selectedMaterials.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

                  {/* Checklist de Materias Primas */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredMaterials.map((material) => (
                        <label
                          key={material.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedMaterials.includes(material.id)
                              ? 'bg-primary/20 border-primary/50'
                              : 'bg-input-dark border-border-dark hover:bg-border-dark'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material.id)}
                            onChange={() => handleToggleMaterial(material.id)}
                            className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                          />
                          <div className="flex-1">
                            <p className="text-text-light font-medium">{material.nombre}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-text-muted text-xs">{material.codigo}</p>
                              <span className="text-text-muted">•</span>
                              <p className="text-text-muted text-xs">{material.unidadMedida}</p>
                              {material.tipo && (
                                <>
                                  <span className="text-text-muted">•</span>
                                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                    {material.tipo}
                                  </span>
                                </>
                              )}
                            </div>
                            {material.descripcion && (
                              <p className="text-text-muted text-xs mt-1 line-clamp-1">{material.descripcion}</p>
                            )}
                          </div>
                        </label>
                      ))}
      </div>

                  {filteredMaterials.length === 0 && (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2">search_off</span>
                      <p className="text-text-muted text-sm">No se encontraron materias primas</p>
          </div>
        )}
      </div>
              ) : (
                /* Pestaña: Bases de Datos Químicas */
        <div>
                  {/* Selector de Base de Datos */}
                  <div className="flex gap-2 mb-4">
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

                  {/* Tipo de Búsqueda */}
                  <div className="mb-4">
                    <label className="block text-text-light text-sm font-medium mb-2">Tipo de Búsqueda</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="NAME">Por Nombre</option>
                      <option value="FORMULA">Por Fórmula Molecular</option>
                      <option value="SMILES">Por SMILES</option>
                      <option value="CAS">Por Número CAS</option>
                    </select>
      </div>

                  {/* Campo de Búsqueda */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchChemical()}
                      placeholder="Buscar compuesto químico..."
                      className="flex-1 h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleSearchChemical}
                      disabled={searching || !searchQuery.trim()}
                      className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">search</span>
                      {searching ? 'Buscando...' : 'Buscar'}
            </button>
                  </div>

                  {/* Resultados */}
                  {searchResults.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <h3 className="text-text-light font-semibold">
                        Resultados ({searchResults.length})
                      </h3>
                      {searchResults.map((compound, index) => (
                        <div
                          key={compound.id || index}
                          className="p-4 rounded-lg bg-input-dark border border-border-dark hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-text-light font-semibold">{compound.name}</h4>
                              {compound.formula && (
                                <p className="text-text-muted text-sm mt-1">Fórmula: {compound.formula}</p>
                              )}
                              {compound.molecularWeight && (
                                <p className="text-text-muted text-sm">Peso Molecular: {compound.molecularWeight} g/mol</p>
                              )}
                              {compound.logP !== null && compound.logP !== undefined && (
                                <p className="text-text-muted text-sm">LogP: {compound.logP}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                                {compound.source}
                              </span>
                              <button
                                onClick={() => handleAddCompound(compound)}
                                className="px-3 py-1 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                              >
                                Agregar
            </button>
          </div>
        </div>
      </div>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && !searching && searchQuery && (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2">search_off</span>
                      <p className="text-text-muted text-sm">No se encontraron resultados</p>
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2">science</span>
                      <p className="text-text-muted text-sm">Ingresa un término de búsqueda para comenzar</p>
                    </div>
                  )}
                </div>
              )}

              {/* Resumen de Selecciones */}
              {(selectedMaterials.length > 0 || selectedCompounds.length > 0) && (
                <div className="mt-6 pt-6 border-t border-border-dark">
                  <h3 className="text-text-light font-semibold mb-3">Resumen de Selecciones</h3>
                  <div className="space-y-2">
                    {selectedMaterials.length > 0 && (
                      <div>
                        <p className="text-text-muted text-xs mb-2">
                          Materias Primas ({selectedMaterials.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedMaterials.map(id => {
                            const material = materials.find(m => m.id === id)
                            return material ? (
                              <span key={id} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                                {material.nombre}
                              </span>
                            ) : null
                          })}
                        </div>
            </div>
                    )}
                    {selectedCompounds.length > 0 && (
            <div>
                        <p className="text-text-muted text-xs mb-2">
                          Compuestos BD Químicas ({selectedCompounds.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompounds.map((compound, idx) => (
                            <span key={compound.id || idx} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                              {compound.name}
                            </span>
                ))}
              </div>
            </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowMaterialSelector(false)}
                  className="px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cerrar
            </button>
                <button
                  onClick={() => {
                    setShowMaterialSelector(false)
                    setShowChemicalSearch(false)
                  }}
                  className="px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  Confirmar Selección
            </button>
          </div>
        </div>
          </div>
        </div>
      )}


      {/* Modal de Detalles de Compuesto */}
      {selectedCompound && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCompound(null)}
        >
          <div
            className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-text-light text-2xl font-bold">{selectedCompound.name}</h2>
                <button
                  onClick={() => setSelectedCompound(null)}
                  className="p-2 rounded-lg text-text-muted hover:text-text-light"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
      </div>

              <div className="space-y-4">
                {selectedCompound.formula && (
                <div>
                    <span className="text-text-muted text-sm">Fórmula Molecular:</span>
                    <p className="text-text-light font-medium">{selectedCompound.formula}</p>
                </div>
                )}

                {selectedCompound.molecularWeight && (
                <div>
                    <span className="text-text-muted text-sm">Peso Molecular:</span>
                    <p className="text-text-light font-medium">{selectedCompound.molecularWeight} g/mol</p>
              </div>
                )}

                {selectedCompound.logP !== null && selectedCompound.logP !== undefined && (
                <div>
                    <span className="text-text-muted text-sm">LogP:</span>
                    <p className="text-text-light font-medium">{selectedCompound.logP}</p>
                </div>
                )}

                {selectedCompound.solubility && (
                <div>
                    <span className="text-text-muted text-sm">Solubilidad:</span>
                    <p className="text-text-light font-medium">{selectedCompound.solubility}</p>
                </div>
                )}

                {selectedCompound.bioactivity && (
                <div>
                    <span className="text-text-muted text-sm">Bioactividad:</span>
                    <p className="text-text-light font-medium">{selectedCompound.bioactivity}</p>
                </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border-dark">
                  <button
                    onClick={() => {
                      handleAddCompound(selectedCompound)
                      setSelectedCompound(null)
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                  >
                    Agregar a Fórmula
                  </button>
                  <button
                    onClick={() => setSelectedCompound(null)}
                    className="px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default IA
