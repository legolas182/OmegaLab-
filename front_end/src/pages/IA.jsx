import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import productService from '../services/productService'
import materialService from '../services/materialService'
import ideaService from '../services/ideaService'
import chemicalDatabaseService from '../services/chemicalDatabaseService'
import formulaService from '../services/formulaService'

const IA = () => {
  const { user } = useAuth()
  
  // Estados para modo: crear desde MP o modificar producto
  const [modo, setModo] = useState('materias-primas') // 'materias-primas' o 'producto'
  
  // Estados para crear desde materias primas
  const [materials, setMaterials] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedCompounds, setSelectedCompounds] = useState([])
  const [objetivo, setObjetivo] = useState('')
  const [rendimiento, setRendimiento] = useState(100)
  
  // Estados para modificar producto (actual)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Estados para búsqueda en BD químicas
  const [showChemicalSearch, setShowChemicalSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('NAME')
  const [searchSource, setSearchSource] = useState('PubChem')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedCompound, setSelectedCompound] = useState(null)
  
  // Estados generales
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showFormulaEditor, setShowFormulaEditor] = useState(false)
  const [formulaData, setFormulaData] = useState(null)

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
    loadProducts()
  }, [])

  const loadMaterials = async () => {
    try {
      const data = await materialService.getMaterials({})
      setMaterials(data || [])
    } catch (error) {
      console.error('Error cargando materias primas:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({})
      setProducts(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
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

  const handleGenerateFormula = async () => {
    if (modo === 'materias-primas') {
      if (selectedMaterials.length === 0) {
        setMessage({ type: 'error', text: 'Debes seleccionar al menos una materia prima' })
        return
      }
      if (!objetivo.trim()) {
        setMessage({ type: 'error', text: 'Debes especificar el objetivo de la fórmula' })
        return
      }

      setGenerating(true)
      setMessage({ type: '', text: '' })

      try {
        // Filtrar compuestos que tienen ID (los de BD químicas pueden no tener ID hasta que se guarden)
        const compoundIds = selectedCompounds
          .map(c => c.id)
          .filter(id => id != null)
        const idea = await ideaService.generateFromMaterials(objetivo, selectedMaterials, compoundIds)
        setMessage({ type: 'success', text: 'Fórmula generada exitosamente. Revisa el módulo de Ideas para ver los detalles.' })
        
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
    } else {
      // Modo modificar producto (código actual)
      if (!selectedProduct) {
        setMessage({ type: 'error', text: 'Debes seleccionar un producto del inventario' })
        return
      }
      if (!objetivo.trim()) {
        setMessage({ type: 'error', text: 'Debes especificar qué quieres lograr' })
        return
      }

      setGenerating(true)
      setMessage({ type: '', text: '' })

      try {
        const idea = await ideaService.generateFromProduct(selectedProduct.id, objetivo)
        setMessage({ type: 'success', text: 'Idea generada exitosamente con IA. Revisa el módulo de Ideas para ver los detalles completos.' })
        setSelectedProduct(null)
        setObjetivo('')
      } catch (error) {
        console.error('Error generando ideas:', error)
        setMessage({ type: 'error', text: error.message || 'Error al generar ideas' })
      } finally {
        setGenerating(false)
      }
    }
  }

  const calculateTotalPercentage = () => {
    // Esto se calculará cuando se implemente el editor de fórmula
    return 0
  }

  return (
    <div className="w-full h-full">
      {/* Mensaje */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Selector de Modo */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setModo('materias-primas')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            modo === 'materias-primas'
              ? 'bg-primary text-white'
              : 'bg-card-dark border border-border-dark text-text-light hover:bg-border-dark'
          }`}
        >
          <span className="material-symbols-outlined align-middle mr-2">science</span>
          Crear Fórmula Experimental
        </button>
        <button
          onClick={() => setModo('producto')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            modo === 'producto'
              ? 'bg-primary text-white'
              : 'bg-card-dark border border-border-dark text-text-light hover:bg-border-dark'
          }`}
        >
          <span className="material-symbols-outlined align-middle mr-2">edit</span>
          Modificar Producto Existente
        </button>
      </div>

      {modo === 'materias-primas' ? (
        /* MODO: Crear Fórmula Experimental */
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

          {/* Selección de Materias Primas */}
          <div className="rounded-lg bg-card-dark border border-border-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-light text-lg font-semibold">Materias Primas</h3>
              <button
                onClick={() => setShowChemicalSearch(true)}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Buscar en BD Químicas
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {materials.map((material) => (
                <label
                  key={material.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMaterials.includes(material.id)
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-input-dark border-border-dark hover:bg-border-dark'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => handleToggleMaterial(material.id)}
                    className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary"
                  />
                  <div className="flex-1">
                    <p className="text-text-light font-medium">{material.nombre}</p>
                    <p className="text-text-muted text-xs">{material.codigo} • {material.unidadMedida}</p>
                  </div>
                </label>
              ))}
            </div>

            {selectedMaterials.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-text-light text-sm font-medium mb-2">
                  Materias primas seleccionadas: {selectedMaterials.length}
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
          </div>

          {/* Compuestos de BD Químicas Seleccionados */}
          {selectedCompounds.length > 0 && (
            <div className="rounded-lg bg-card-dark border border-border-dark p-6">
              <h3 className="text-text-light text-lg font-semibold mb-4">Compuestos de BD Químicas</h3>
              <div className="space-y-2">
                {selectedCompounds.map((compound) => (
                  <div key={compound.id} className="p-3 rounded-lg bg-input-dark border border-border-dark">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-text-light font-medium">{compound.name}</p>
                        {compound.formula && (
                          <p className="text-text-muted text-xs mt-1">Fórmula: {compound.formula}</p>
                        )}
                        {compound.molecularWeight && (
                          <p className="text-text-muted text-xs">MW: {compound.molecularWeight} g/mol</p>
                        )}
                        <span className="inline-block mt-2 px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                          {compound.source}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCompounds(selectedCompounds.filter(c => c.id !== compound.id))}
                        className="p-1 rounded text-text-muted hover:text-danger"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón Generar */}
          <button
            onClick={handleGenerateFormula}
            disabled={generating || selectedMaterials.length === 0 || !objetivo.trim()}
            className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Generando fórmula con IA...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">psychology</span>
                Generar Fórmula Experimental con IA
              </>
            )}
          </button>
        </div>
      ) : (
        /* MODO: Modificar Producto Existente */
        <div className="rounded-lg bg-card-dark border border-border-dark p-6">
          <h2 className="text-text-light text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Modificar Producto Existente
          </h2>
          <p className="text-text-muted text-sm mb-6">
            Selecciona un producto del inventario y especifica qué quieres lograr. 
            La IA analizará el producto completo (incluyendo su BOM) y generará nuevas fórmulas sugeridas.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Seleccionar Producto del Inventario
              </label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === parseInt(e.target.value))
                  setSelectedProduct(product || null)
                }}
                className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
              >
                <option value="">-- Selecciona un producto --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.codigo} - {product.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                ¿Qué quieres lograr? <span className="text-text-muted">(Objetivo)</span>
              </label>
              <textarea
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={3}
                placeholder='Ejemplo: "quiero crear una proteína para diabéticos"'
                className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={handleGenerateFormula}
              disabled={generating || !selectedProduct || !objetivo.trim()}
              className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Analizando producto y generando ideas...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">psychology</span>
                  Generar Ideas con IA
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Búsqueda en BD Químicas */}
      {showChemicalSearch && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChemicalSearch(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-card-dark border-b border-border-dark p-6 flex items-center justify-between z-10">
              <h2 className="text-text-light text-2xl font-bold">Búsqueda en Bases de Datos Químicas</h2>
              <button
                onClick={() => setShowChemicalSearch(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-border-dark"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selector de Base de Datos */}
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

              {/* Tipo de Búsqueda */}
              <div>
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
              <div className="flex gap-2">
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
                <div className="space-y-3">
                  <h3 className="text-text-light font-semibold">
                    Resultados ({searchResults.length})
                  </h3>
                  {searchResults.map((compound, index) => (
                    <div
                      key={compound.id || index}
                      className="p-4 rounded-lg bg-input-dark border border-border-dark hover:border-primary/50 cursor-pointer"
                      onClick={() => {
                        setSelectedCompound(compound)
                      }}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddCompound(compound)
                            }}
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
