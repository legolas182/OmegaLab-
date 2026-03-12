import { useState, useEffect } from 'react'
import categoryService from '../../services/categoryService'
import ConfirmDialog from '../../components/ConfirmDialog'

const Categorias = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [filterTipoProducto, setFilterTipoProducto] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  const [newCategory, setNewCategory] = useState({
    nombre: '',
    descripcion: '',
    tipoProducto: 'PRODUCTO_TERMINADO'
  })

  useEffect(() => {
    loadCategories()
    setCurrentPage(1)
  }, [searchTerm, filterTipoProducto])

  useEffect(() => {
    setCurrentPage(1)
  }, [showInactive])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const filters = { all: true } // Obtener todas las categorías (activas e inactivas) para administración
      if (searchTerm) filters.search = searchTerm
      if (filterTipoProducto) filters.tipoProducto = filterTipoProducto
      const data = await categoryService.getCategories(filters)
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await categoryService.createCategory(newCategory)
      await loadCategories()
      setShowCreateModal(false)
      setNewCategory({
        nombre: '',
        descripcion: '',
        tipoProducto: 'PRODUCTO_TERMINADO'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTipoProductoLabel = (tipo) => {
    if (!tipo) return ''
    const tipoStr = typeof tipo === 'string' ? tipo : (tipo?.name || tipo?.toString() || '')
    const labels = {
      'PRODUCTO_TERMINADO': 'Producto Terminado',
      'producto_terminado': 'Producto Terminado',
      'MATERIA_PRIMA': 'Materia Prima',
      'materia_prima': 'Materia Prima',
      'COMPONENTE': 'Componente',
      'componente': 'Componente'
    }
    return labels[tipoStr] || tipoStr
  }

  const handleEditCategory = async (category) => {
    // Asegurar que el tipo de producto sea un string
    const tipoProducto = typeof category.tipoProducto === 'string' 
      ? category.tipoProducto 
      : (category.tipoProducto?.name || category.tipoProducto?.toString() || 'PRODUCTO_TERMINADO')
    
    setEditingCategory({
      ...category,
      tipoProducto: tipoProducto
    })
    setShowEditModal(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      // Enviar solo los campos necesarios para la actualización
      await categoryService.updateCategory(editingCategory.id, {
        nombre: editingCategory.nombre,
        descripcion: editingCategory.descripcion || '',
        tipoProducto: editingCategory.tipoProducto,
        estado: editingCategory.estado || 'ACTIVO'
      })
      await loadCategories()
      setShowEditModal(false)
      setEditingCategory(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = (category) => {
    const newEstado = category.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    const action = newEstado === 'ACTIVO' ? 'activar' : 'inactivar'
    
    setConfirmDialog({
      isOpen: true,
      title: `${action === 'activar' ? 'Activar' : 'Inactivar'} Categoría`,
      message: `¿Estás seguro de ${action} esta categoría? ${action === 'inactivar' ? 'No estará disponible para su uso.' : 'Estará disponible para su uso.'}`,
      onConfirm: async () => {
        try {
          setLoading(true)
          // Enviar solo los campos necesarios para la actualización
          await categoryService.updateCategory(category.id, {
            nombre: category.nombre,
            descripcion: category.descripcion || '',
            tipoProducto: typeof category.tipoProducto === 'string' 
              ? category.tipoProducto 
              : (category.tipoProducto?.name || category.tipoProducto?.toString() || 'PRODUCTO_TERMINADO'),
            estado: newEstado
          })
          await loadCategories()
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: newEstado === 'ACTIVO' ? 'success' : 'warning'
    })
  }

  const handleDeleteCategory = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Categoría',
      message: '¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setLoading(true)
          await categoryService.deleteCategory(id)
          await loadCategories()
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: 'danger'
    })
  }

  // Paginación
  const filteredCategories = categories.filter(category => showInactive || category.estado === 'ACTIVO')
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const currentCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex-1 min-w-[200px] flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] h-12 px-4 rounded-xl bg-slate-950/50 border border-white/5 text-text-light placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 transition-all text-sm"
          />
          <select
            value={filterTipoProducto}
            onChange={(e) => setFilterTipoProducto(e.target.value)}
            className="h-12 px-4 rounded-xl bg-slate-950/50 border border-white/5 text-text-light focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
          >
            <option value="" className="bg-slate-900">Todos los tipos</option>
            <option value="PRODUCTO_TERMINADO" className="bg-slate-900">Producto Terminado</option>
            <option value="MATERIA_PRIMA" className="bg-slate-900">Materia Prima</option>
            <option value="COMPONENTE" className="bg-slate-900">Componente</option>
          </select>
          <label className="flex items-center gap-2 text-text-light text-sm cursor-pointer whitespace-nowrap bg-white/5 px-4 h-12 rounded-xl border border-white/10 hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary/50 cursor-pointer accent-primary"
            />
            <span>Mostrar inactivas</span>
          </label>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nueva Categoría
        </button>
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
              <span className="material-symbols-outlined text-primary">category</span>
              Catálogo de Categorías
            </h2>
            <span className="text-xs font-medium text-text-muted bg-white/5 px-2 py-1 rounded border border-white/10">
              {filteredCategories.length} Registros
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
            {loading && !categories.length ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-text-muted text-sm">Cargando datos...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-text-muted/30 mb-4">category</span>
                <p className="text-text-muted text-sm font-medium">
                  {showInactive ? 'No hay categorías registradas' : 'No hay categorías activas'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                  <thead className="sticky top-0 bg-card-dark z-10">
                    <tr className="border-b border-border-dark shadow-sm">
                      <th className="p-4 w-[20%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Nombre</th>
                      <th className="p-4 w-[20%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Tipo de Producto</th>
                      <th className="p-4 w-[40%] text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Descripción</th>
                      <th className="p-4 w-[10%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Estado</th>
                      <th className="p-4 w-[10%] text-center text-text-muted text-xs font-semibold uppercase align-middle whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-border-dark/30">
                  {currentCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="group transition-colors hover:bg-white/5"
                    >
                      <td className="p-4 text-center align-middle">
                        <span className="text-text-light font-bold text-sm">{category.nombre}</span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                          {getTipoProductoLabel(category.tipoProducto)}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="text-text-muted text-sm line-clamp-2">
                          {category.descripcion || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase border ${
                          category.estado === 'ACTIVO' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-white/5 text-text-muted border-white/10'
                        }`}>
                          {category.estado}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-primary hover:bg-primary/20 hover:text-white transition-all border border-white/10 hover:border-primary/30"
                            title="Editar categoría"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 transition-all border border-white/10 ${
                              category.estado === 'ACTIVO'
                                ? 'text-warning hover:bg-warning/20 hover:text-warning hover:border-warning/30'
                                : 'text-success hover:bg-success/20 hover:text-success hover:border-success/30'
                            }`}
                            title={category.estado === 'ACTIVO' ? 'Inactivar categoría' : 'Activar categoría'}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {category.estado === 'ACTIVO' ? 'power_settings_new' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-danger hover:bg-danger/20 hover:text-white transition-all border border-white/10 hover:border-danger/30"
                            title="Eliminar categoría"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && filteredCategories.length > 0 && (
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Nueva Categoría</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newCategory.nombre}
                  onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Nombre de la categoría"
                />
                <p className="text-text-muted text-xs mt-1">
                  Nota: Puedes usar el mismo nombre para diferentes tipos de producto (ej: "Saborizantes" como Materia Prima y como Componente)
                </p>
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={newCategory.descripcion}
                  onChange={(e) => setNewCategory({ ...newCategory, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Descripción de la categoría"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Tipo de Producto *</label>
                <select
                  required
                  value={newCategory.tipoProducto}
                  onChange={(e) => setNewCategory({ ...newCategory, tipoProducto: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                >
                  <option value="PRODUCTO_TERMINADO">Producto Terminado</option>
                  <option value="MATERIA_PRIMA">Materia Prima</option>
                  <option value="COMPONENTE">Componente</option>
                </select>
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
                  {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Editar Categoría</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCategory(null)
                }}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.nombre}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={editingCategory.descripcion || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Descripción de la categoría"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Tipo de Producto *</label>
                <select
                  required
                  value={editingCategory.tipoProducto}
                  onChange={(e) => setEditingCategory({ ...editingCategory, tipoProducto: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                >
                  <option value="PRODUCTO_TERMINADO">Producto Terminado</option>
                  <option value="MATERIA_PRIMA">Materia Prima</option>
                  <option value="COMPONENTE">Componente</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCategory(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
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

export default Categorias

