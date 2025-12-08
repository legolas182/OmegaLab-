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
  }, [searchTerm, filterTipoProducto])

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px] flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={filterTipoProducto}
            onChange={(e) => setFilterTipoProducto(e.target.value)}
            className="h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos los tipos</option>
            <option value="PRODUCTO_TERMINADO">Producto Terminado</option>
            <option value="MATERIA_PRIMA">Materia Prima</option>
            <option value="COMPONENTE">Componente</option>
          </select>
          <label className="flex items-center gap-2 text-text-light text-sm cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded bg-input-dark border-border-dark text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
            />
            <span>Mostrar inactivas</span>
          </label>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
        >
          Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {loading && !categories.length ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : (
        <div className="rounded-lg bg-card-dark border border-border-dark overflow-hidden">
          {categories.filter(category => showInactive || category.estado === 'ACTIVO').length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              {showInactive ? 'No hay categorías registradas' : 'No hay categorías activas'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-input-dark border-b border-border-dark">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-light">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-light">Tipo de Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-light">Descripción</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-light">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories
                    .filter(category => showInactive || category.estado === 'ACTIVO')
                    .map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border-dark hover:bg-input-dark/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-text-light font-medium">{category.nombre}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                          {getTipoProductoLabel(category.tipoProducto)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text-muted text-sm">
                          {category.descripcion || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          category.estado === 'ACTIVO' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-text-muted/20 text-text-muted'
                        }`}>
                          {category.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="Editar categoría"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className={`transition-colors ${
                              category.estado === 'ACTIVO'
                                ? 'text-warning hover:text-warning/80'
                                : 'text-success hover:text-success/80'
                            }`}
                            title={category.estado === 'ACTIVO' ? 'Inactivar categoría' : 'Activar categoría'}
                          >
                            <span className="material-symbols-outlined">
                              {category.estado === 'ACTIVO' ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-danger hover:text-danger/80 transition-colors"
                            title="Eliminar categoría"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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

