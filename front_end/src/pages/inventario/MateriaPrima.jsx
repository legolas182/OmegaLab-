import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { hasAnyRole } from '../../utils/rolePermissions'
import materialService from '../../services/materialService'
import categoryService from '../../services/categoryService'
import ConfirmDialog from '../../components/ConfirmDialog'

const MateriaPrima = () => {
  const { user } = useAuth()
  const isSupervisorCalidad = hasAnyRole(user, 'SUPERVISOR_CALIDAD')
  const isAdmin = hasAnyRole(user, 'ADMINISTRADOR')
  const isSupervisorQA = hasAnyRole(user, 'SUPERVISOR_QA')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
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
    setCurrentPage(1)
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

  const handleToggleStatus = (material) => {
    const newEstado = material.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    const action = newEstado === 'ACTIVO' ? 'activar' : 'inactivar'

    setConfirmDialog({
      isOpen: true,
      title: `${action === 'activar' ? 'Activar' : 'Inactivar'} Material`,
      message: `¿Estás seguro de ${action} este material? ${action === 'inactivar' ? 'No estará disponible para su uso.' : 'Estará disponible para su uso.'}`,
      onConfirm: async () => {
        try {
          setLoading(true)
          await materialService.updateMaterial(material.id, {
            codigo: material.codigo,
            nombre: material.nombre,
            descripcion: material.descripcion || '',
            categoriaId: material.categoriaId,
            tipo: material.tipo,
            unidadMedida: material.unidadMedida,
            estado: newEstado
          })
          await loadMaterials()
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: newEstado === 'ACTIVO' ? 'success' : 'warning'
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

  // Paginación
  const totalPages = Math.ceil(materials.length / itemsPerPage)
  const currentMaterials = materials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex-1 min-w-[200px] flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] h-12 px-4 rounded-xl bg-slate-950/50 border border-white/5 text-text-light placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 transition-all text-sm"
          />
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="h-12 px-4 rounded-xl bg-slate-950/50 border border-white/5 text-text-light focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
          >
            <option value="" className="bg-slate-900">Todos los tipos</option>
            <option value="MATERIA_PRIMA" className="bg-slate-900">Materia Prima</option>
            <option value="COMPONENTE" className="bg-slate-900">Componente</option>
          </select>
        </div>
        {!isSupervisorCalidad && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Material
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-danger/20 border border-danger/50 p-4 flex items-center gap-3 shrink-0">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-1 min-h-0 gap-6 overflow-hidden">
        <div className="rounded-xl bg-card-dark border border-border-dark flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border-dark shrink-0 bg-white/5 flex justify-between items-center">
            <h2 className="text-text-light font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">science</span>
              Catálogo de Materia Prima
            </h2>
            <span className="text-xs font-medium text-text-muted bg-white/5 px-2 py-1 rounded border border-white/10">
              {materials.length} Registros
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
            {loading && !materials.length ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-text-muted text-sm">Cargando datos...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-text-muted/30 mb-4">science</span>
                <p className="text-text-muted text-sm font-medium">No hay materiales registrados</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-card-dark z-10">
                  <tr className="border-b border-border-dark shadow-sm">
                    <th className="p-4 w-[12%] text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Código</th>
                    <th className="p-4 w-[28%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Nombre</th>
                    <th className="p-4 w-[12%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Tipo</th>
                    <th className="p-4 w-[15%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Categoría</th>
                    <th className="p-4 w-[10%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Unidad</th>
                    {isSupervisorCalidad && (
                      <th className="p-4 w-[11%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Cantidad en Stock</th>
                    )}
                    <th className="p-4 w-[12%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Estado</th>
                    {!isSupervisorCalidad && (
                      <th className="p-4 w-[11%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/30">
                  {currentMaterials.map((material) => (
                    <tr key={material.id} className="group transition-colors hover:bg-white/5">
                      <td className="p-4 align-middle text-text-light font-bold text-sm tracking-tight">{material.codigo}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-text-light font-medium text-sm">{material.nombre}</span>
                          {!isSupervisorCalidad && compoundsCount[material.id] > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1 w-max" title={`${compoundsCount[material.id]} compuesto(s) molecular(es)`}>
                              <span className="material-symbols-outlined text-[12px] leading-none text-emerald-400">science</span>
                              {compoundsCount[material.id]} compuesto(s)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                          {material.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="text-text-muted text-sm">{getCategoryName(material.categoriaId)}</span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="text-text-muted text-sm font-mono">{material.unidadMedida}</span>
                      </td>
                      {isSupervisorCalidad && (
                        <td className="p-4 text-center align-middle">
                          <span className="text-text-light font-bold text-sm">
                            {material.cantidadStock !== null && material.cantidadStock !== undefined 
                              ? Math.round(parseFloat(material.cantidadStock))
                              : '0'}
                          </span>
                        </td>
                      )}
                      <td className="p-4 text-center align-middle">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase border ${
                          material.estado === 'ACTIVO' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-white/5 text-text-muted border-white/10'
                        }`}>
                          {material.estado}
                        </span>
                      </td>
                      {!isSupervisorCalidad && (
                        <td className="p-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewCompounds(material)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-emerald-400 hover:bg-emerald-400/20 hover:text-emerald-300 transition-all border border-white/10 hover:border-emerald-400/30"
                              title="Ver compuestos moleculares"
                            >
                              <span className="material-symbols-outlined text-sm">science</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(material)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 transition-all border border-white/10 ${
                                material.estado === 'ACTIVO'
                                  ? 'text-warning hover:bg-warning/20 hover:text-warning hover:border-warning/30'
                                  : 'text-success hover:bg-success/20 hover:text-success hover:border-success/30'
                              }`}
                              title={material.estado === 'ACTIVO' ? 'Inactivar material' : 'Activar material'}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {material.estado === 'ACTIVO' ? 'power_settings_new' : 'play_arrow'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-danger hover:bg-danger/20 hover:text-white transition-all border border-white/10 hover:border-danger/30"
                              title="Eliminar material"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && materials.length > 0 && (
            <div className="p-2.5 border-t border-border-dark bg-white/5 shrink-0 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-text-light hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/10 hover:border-primary/30 group"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">chevron_left</span>
              </button>
              
              <span className="text-xs font-medium text-text-muted bg-slate-900/50 px-3 py-1.5 rounded-md border border-white/5">
                Página <span className="text-text-light font-bold">{currentPage}</span> de <span className="text-text-light font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-text-light hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/10 hover:border-primary/30 group"
              >
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && !isSupervisorCalidad && (
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

      {/* Modal de Compuestos Moleculares - Solo para Admin y Supervisor QA */}
      {showCompoundsModal && selectedMaterial && !isSupervisorCalidad && (
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

