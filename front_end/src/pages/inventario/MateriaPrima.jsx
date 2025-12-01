import { useState, useEffect } from 'react'
import materialService from '../../services/materialService'
import categoryService from '../../services/categoryService'
import ConfirmDialog from '../../components/ConfirmDialog'

const MateriaPrima = () => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [materialCompounds, setMaterialCompounds] = useState([])
  const [loadingCompounds, setLoadingCompounds] = useState(false)
  const [showCompoundsModal, setShowCompoundsModal] = useState(false)
  const [compoundsCount, setCompoundsCount] = useState({}) // { materialId: count }
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  const [newMaterial, setNewMaterial] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: null,
    tipo: 'MATERIA_PRIMA',
    unidadMedida: 'kg'
  })
  const [filteredCategories, setFilteredCategories] = useState([])
  const [compounds, setCompounds] = useState([])
  const [newCompound, setNewCompound] = useState({
    nombreCompuesto: '',
    formulaMolecular: '',
    pesoMolecular: '',
    porcentajeConcentracion: '',
    tipoCompuesto: '',
    descripcion: ''
  })

  useEffect(() => {
    loadMaterials()
    loadCategories()
  }, [searchTerm, filterTipo])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (searchTerm) filters.search = searchTerm
      if (filterTipo) filters.tipo = filterTipo
      const data = await materialService.getMaterials(filters)
      setMaterials(data)
      
      // Cargar conteo de compuestos para cada material (en paralelo para mejor rendimiento)
      const counts = {}
      const compoundPromises = data.map(async (material) => {
        try {
          const compounds = await materialService.getMaterialCompounds(material.id)
          counts[material.id] = compounds.length
        } catch (err) {
          counts[material.id] = 0
        }
      })
      await Promise.all(compoundPromises)
      setCompoundsCount(counts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      // Cargar todas las categorías (tanto MATERIA_PRIMA como COMPONENTE)
      const all = await categoryService.getCategories({ all: true })
      const filtered = all.filter(cat => {
        const tipo = cat.tipoProducto
        const tipoStr = typeof tipo === 'string' ? tipo : (tipo?.name || tipo?.toString() || '')
        return tipoStr === 'MATERIA_PRIMA' || 
               tipoStr === 'materia_prima' ||
               tipoStr === 'COMPONENTE' ||
               tipoStr === 'componente' ||
               tipoStr.toUpperCase() === 'MATERIA_PRIMA' ||
               tipoStr.toUpperCase() === 'COMPONENTE'
      })
      setCategories(filtered)
      // Filtrar categorías según el tipo seleccionado inicialmente
      updateFilteredCategories(newMaterial.tipo, filtered)
    } catch (err) {
      console.error('Error cargando categorías:', err)
      setCategories([])
      setFilteredCategories([])
    }
  }

  const updateFilteredCategories = (tipo, allCategories = categories) => {
    if (!tipo || allCategories.length === 0) {
      setFilteredCategories(allCategories)
      return
    }
    const filtered = allCategories.filter(cat => {
      const tipoCat = cat.tipoProducto
      const tipoStr = typeof tipoCat === 'string' ? tipoCat : (tipoCat?.name || tipoCat?.toString() || '')
      return tipoStr.toUpperCase() === tipo.toUpperCase()
    })
    setFilteredCategories(filtered)
    // Si la categoría seleccionada no coincide con el nuevo tipo, limpiarla
    if (newMaterial.categoriaId) {
      const selectedCategory = allCategories.find(cat => cat.id === newMaterial.categoriaId)
      if (selectedCategory) {
        const tipoCat = selectedCategory.tipoProducto
        const tipoStr = typeof tipoCat === 'string' ? tipoCat : (tipoCat?.name || tipoCat?.toString() || '')
        if (tipoStr.toUpperCase() !== tipo.toUpperCase()) {
          setNewMaterial({ ...newMaterial, categoriaId: null })
        }
      }
    }
  }

  // Helper para obtener el nombre de la categoría desde categoriaId
  const getCategoryName = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría'
    const category = categories.find(cat => cat.id === categoriaId)
    return category ? category.nombre : 'Sin categoría'
  }

  const handleCreateMaterial = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      // Crear el material primero
      const createdMaterial = await materialService.createMaterial(newMaterial)
      
      // Crear los compuestos si hay alguno
      if (compounds.length > 0) {
        for (const compound of compounds) {
          try {
            await materialService.createMaterialCompound(createdMaterial.id, compound)
          } catch (compoundErr) {
            console.error('Error creando compuesto:', compoundErr)
            // Continuar con los demás compuestos aunque uno falle
          }
        }
      }
      
      await loadMaterials()
      setShowCreateModal(false)
      setNewMaterial({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoriaId: null,
        tipo: 'MATERIA_PRIMA',
        unidadMedida: 'kg'
      })
      setCompounds([])
      setNewCompound({
        nombreCompuesto: '',
        formulaMolecular: '',
        pesoMolecular: '',
        porcentajeConcentracion: '',
        tipoCompuesto: '',
        descripcion: ''
      })
      updateFilteredCategories('MATERIA_PRIMA')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompound = () => {
    if (!newCompound.nombreCompuesto.trim()) {
      setError('El nombre del compuesto es requerido')
      return
    }
    
    const compound = {
      nombreCompuesto: newCompound.nombreCompuesto.trim(),
      formulaMolecular: newCompound.formulaMolecular.trim() || null,
      pesoMolecular: newCompound.pesoMolecular ? parseFloat(newCompound.pesoMolecular) : null,
      porcentajeConcentracion: newCompound.porcentajeConcentracion ? parseFloat(newCompound.porcentajeConcentracion) : null,
      tipoCompuesto: newCompound.tipoCompuesto.trim() || null,
      descripcion: newCompound.descripcion.trim() || null
    }
    
    setCompounds([...compounds, compound])
    setNewCompound({
      nombreCompuesto: '',
      formulaMolecular: '',
      pesoMolecular: '',
      porcentajeConcentracion: '',
      tipoCompuesto: '',
      descripcion: ''
    })
    setError('')
  }

  const handleRemoveCompound = (index) => {
    setCompounds(compounds.filter((_, i) => i !== index))
  }

  const handleDeleteMaterial = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Material',
      message: '¿Estás seguro de eliminar este material? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setLoading(true)
          await materialService.deleteMaterial(id)
          await loadMaterials()
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: 'danger'
    })
  }

  const handleViewCompounds = async (material) => {
    setSelectedMaterial(material)
    setShowCompoundsModal(true)
    setLoadingCompounds(true)
    try {
      const compounds = await materialService.getMaterialCompounds(material.id)
      setMaterialCompounds(compounds)
    } catch (err) {
      setError('Error al cargar compuestos moleculares: ' + err.message)
      setMaterialCompounds([])
    } finally {
      setLoadingCompounds(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos los tipos</option>
            <option value="MATERIA_PRIMA">Materia Prima</option>
            <option value="COMPONENTE">Componente</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
        >
          Nuevo Material
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {loading && !materials.length ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : (
        <div className="rounded-lg bg-card-dark border border-border-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Código</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Nombre</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Tipo</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Categoría</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Unidad</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Estado</th>
                  <th className="text-right p-4 text-text-muted text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-text-muted">
                      No hay materiales registrados
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id} className="border-b border-border-dark hover:bg-border-dark/30">
                      <td className="p-4 text-text-light font-medium">{material.codigo}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-text-light">{material.nombre}</span>
                          {compoundsCount[material.id] > 0 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 flex items-center gap-1" title={`${compoundsCount[material.id]} compuesto(s) molecular(es)`}>
                              <span className="material-symbols-outlined text-xs">science</span>
                              {compoundsCount[material.id]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                          {material.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted">{getCategoryName(material.categoriaId)}</td>
                      <td className="p-4 text-text-muted">{material.unidadMedida}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          material.estado === 'ACTIVO' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-text-muted/20 text-text-muted'
                        }`}>
                          {material.estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCompounds(material)}
                            className="px-3 py-1 rounded text-sm text-primary hover:bg-primary/10 flex items-center gap-1"
                            title="Ver compuestos moleculares"
                          >
                            <span className="material-symbols-outlined text-sm">science</span>
                            Compuestos
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="px-3 py-1 rounded text-sm text-danger hover:bg-danger/10"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Nuevo Material</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Código *</label>
                <input
                  type="text"
                  required
                  value={newMaterial.codigo}
                  onChange={(e) => setNewMaterial({ ...newMaterial, codigo: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Ej: MP-001"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newMaterial.nombre}
                  onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Nombre del material"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={newMaterial.descripcion}
                  onChange={(e) => setNewMaterial({ ...newMaterial, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Descripción del material"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Tipo *</label>
                  <select
                    required
                    value={newMaterial.tipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value
                      setNewMaterial({ ...newMaterial, tipo: nuevoTipo, categoriaId: null })
                      updateFilteredCategories(nuevoTipo)
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="MATERIA_PRIMA">Materia Prima</option>
                    <option value="COMPONENTE">Componente</option>
                  </select>
                  <p className="text-text-muted text-xs mt-1">
                    El tipo determina qué categorías están disponibles
                  </p>
                </div>
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={newMaterial.categoriaId || ''}
                    onChange={(e) => {
                      setNewMaterial({ 
                        ...newMaterial, 
                        categoriaId: e.target.value ? parseInt(e.target.value) : null
                      })
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    disabled={filteredCategories.length === 0}
                  >
                    <option value="">
                      {filteredCategories.length === 0 ? 'Cargando categorías...' : 'Seleccionar categoría...'}
                    </option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                  {filteredCategories.length === 0 && categories.length > 0 && (
                    <p className="text-text-muted text-xs mt-1">
                      No hay categorías de tipo "{newMaterial.tipo === 'MATERIA_PRIMA' ? 'Materia Prima' : 'Componente'}" disponibles. Crea categorías en la sección de Categorías.
                    </p>
                  )}
                  {categories.length === 0 && (
                    <p className="text-text-muted text-xs mt-1">
                      No hay categorías disponibles. Crea categorías en la sección de Categorías.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Unidad de Medida</label>
                <select
                  value={newMaterial.unidadMedida}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unidadMedida: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                >
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="g">Gramo (g)</option>
                  <option value="mg">Miligramo (mg)</option>
                  <option value="L">Litro (L)</option>
                  <option value="mL">Mililitro (mL)</option>
                  <option value="un">Unidad (un)</option>
                </select>
              </div>

              {/* Sección de Compuestos Moleculares */}
              <div className="pt-4 border-t border-border-dark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-text-light font-semibold">Compuestos Moleculares</h3>
                  <span className="text-text-muted text-sm">{compounds.length} agregado{compounds.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Lista de compuestos agregados */}
                {compounds.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {compounds.map((compound, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-input-dark border border-border-dark flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-text-light font-medium">{compound.nombreCompuesto}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-text-muted">
                            {compound.formulaMolecular && (
                              <span>Fórmula: {compound.formulaMolecular}</span>
                            )}
                            {compound.pesoMolecular && (
                              <span>Peso: {compound.pesoMolecular} g/mol</span>
                            )}
                            {compound.porcentajeConcentracion && (
                              <span>Concentración: {compound.porcentajeConcentracion}%</span>
                            )}
                            {compound.tipoCompuesto && (
                              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">
                                {compound.tipoCompuesto}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompound(idx)}
                          className="ml-2 text-danger hover:text-danger/80"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para agregar nuevo compuesto */}
                <div className="space-y-3 p-4 rounded-lg bg-input-dark border border-border-dark">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-light text-xs font-medium mb-1">Nombre del Compuesto *</label>
                      <input
                        type="text"
                        value={newCompound.nombreCompuesto}
                        onChange={(e) => setNewCompound({ ...newCompound, nombreCompuesto: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="Ej: Leucina"
                      />
                    </div>
                    <div>
                      <label className="block text-text-light text-xs font-medium mb-1">Fórmula Molecular</label>
                      <input
                        type="text"
                        value={newCompound.formulaMolecular}
                        onChange={(e) => setNewCompound({ ...newCompound, formulaMolecular: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="Ej: C6H13NO2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-text-light text-xs font-medium mb-1">Peso Molecular (g/mol)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCompound.pesoMolecular}
                        onChange={(e) => setNewCompound({ ...newCompound, pesoMolecular: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="131.17"
                      />
                    </div>
                    <div>
                      <label className="block text-text-light text-xs font-medium mb-1">Concentración (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCompound.porcentajeConcentracion}
                        onChange={(e) => setNewCompound({ ...newCompound, porcentajeConcentracion: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="10.5"
                      />
                    </div>
                    <div>
                      <label className="block text-text-light text-xs font-medium mb-1">Tipo de Compuesto</label>
                      <input
                        type="text"
                        value={newCompound.tipoCompuesto}
                        onChange={(e) => setNewCompound({ ...newCompound, tipoCompuesto: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="Ej: Aminoácido Esencial"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-light text-xs font-medium mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={newCompound.descripcion}
                      onChange={(e) => setNewCompound({ ...newCompound, descripcion: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-card-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm"
                      placeholder="Descripción del compuesto (opcional)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCompound}
                    className="w-full px-4 py-2 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 text-sm"
                  >
                    Agregar Compuesto
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Compuestos Moleculares */}
      {showCompoundsModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-dark flex items-center justify-between sticky top-0 bg-card-dark">
              <div>
                <h2 className="text-text-light text-xl font-semibold">Compuestos Moleculares</h2>
                <p className="text-text-muted text-sm mt-1">{selectedMaterial.nombre} ({selectedMaterial.codigo})</p>
              </div>
              <button
                onClick={() => {
                  setShowCompoundsModal(false)
                  setSelectedMaterial(null)
                  setMaterialCompounds([])
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {loadingCompounds ? (
                <div className="text-center py-12 text-text-muted">Cargando compuestos...</div>
              ) : materialCompounds.length === 0 ? (
                <div className="text-center py-12 rounded-lg bg-input-dark border border-border-dark">
                  <span className="material-symbols-outlined text-4xl text-text-muted mb-2">science</span>
                  <p className="text-text-muted text-sm">No hay compuestos moleculares registrados para este material</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {materialCompounds.map((compound) => (
                    <div
                      key={compound.id}
                      className="p-4 rounded-lg bg-input-dark border border-border-dark hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-text-light font-semibold text-lg mb-2">{compound.nombreCompuesto}</h3>
                          {compound.tipoCompuesto && (
                            <span className="inline-block px-2 py-1 rounded bg-primary/20 text-primary text-xs mb-2">
                              {compound.tipoCompuesto}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {compound.formulaMolecular && (
                          <div>
                            <p className="text-text-muted text-xs mb-1">Fórmula Molecular</p>
                            <p className="text-text-light font-mono text-sm">{compound.formulaMolecular}</p>
                          </div>
                        )}
                        {compound.pesoMolecular && (
                          <div>
                            <p className="text-text-muted text-xs mb-1">Peso Molecular</p>
                            <p className="text-text-light text-sm">{compound.pesoMolecular} g/mol</p>
                          </div>
                        )}
                        {compound.porcentajeConcentracion && (
                          <div>
                            <p className="text-text-muted text-xs mb-1">Concentración</p>
                            <p className="text-text-light text-sm">{compound.porcentajeConcentracion}%</p>
                          </div>
                        )}
                      </div>
                      {compound.descripcion && (
                        <div className="mt-3 pt-3 border-t border-border-dark">
                          <p className="text-text-muted text-xs mb-1">Descripción</p>
                          <p className="text-text-light text-sm">{compound.descripcion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}

export default MateriaPrima

