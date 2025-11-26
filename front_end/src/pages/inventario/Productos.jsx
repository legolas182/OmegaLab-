import { useState, useEffect } from 'react'
import productService from '../../services/productService'
import materialService from '../../services/materialService'
<<<<<<< HEAD
import categoryService from '../../services/categoryService'
import ConfirmDialog from '../../components/ConfirmDialog'
=======
>>>>>>> origin/main

const Productos = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [bom, setBom] = useState(null)
  const [materials, setMaterials] = useState([])
<<<<<<< HEAD
  const [categories, setCategories] = useState([])
=======
>>>>>>> origin/main
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
<<<<<<< HEAD
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })
=======
  const [searchTerm, setSearchTerm] = useState('')
>>>>>>> origin/main

  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
<<<<<<< HEAD
    categoriaId: null,
=======
>>>>>>> origin/main
    unidadMedida: 'un'
  })

  const [newMaterial, setNewMaterial] = useState({
    materialId: '',
    cantidad: '',
    unidad: 'mg',
    porcentaje: ''
  })

  useEffect(() => {
    loadProducts()
    loadMaterials()
<<<<<<< HEAD
    loadCategories()
=======
>>>>>>> origin/main
  }, [searchTerm])

  useEffect(() => {
    if (selectedProduct) {
      loadProductBOM(selectedProduct.id)
    }
  }, [selectedProduct])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (searchTerm) filters.search = searchTerm
      const data = await productService.getProducts(filters)
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMaterials = async () => {
    try {
      const data = await materialService.getMaterials()
      setMaterials(data)
    } catch (err) {
      console.error('Error cargando materiales:', err)
    }
  }

<<<<<<< HEAD
  const loadCategories = async () => {
    try {
      // Primero intentamos cargar todas las categorías
      const allCategories = await categoryService.getCategories()
      console.log('Todas las categorías cargadas:', allCategories)
      console.log('Número de categorías:', allCategories?.length || 0)
      
      if (!allCategories || allCategories.length === 0) {
        console.warn('No se encontraron categorías en la base de datos')
        setCategories([])
        return
      }
      
      // Filtrar solo las de tipo PRODUCTO_TERMINADO en el frontend
      // El tipoProducto puede venir como enum (objeto) o como string
      const filteredCategories = allCategories.filter(cat => {
        const tipo = cat.tipoProducto
        // Puede ser string "PRODUCTO_TERMINADO" o el nombre del enum
        const tipoStr = typeof tipo === 'string' ? tipo : (tipo?.name || tipo?.toString() || '')
        return tipoStr === 'PRODUCTO_TERMINADO' || 
               tipoStr === 'producto_terminado' ||
               tipoStr.toUpperCase() === 'PRODUCTO_TERMINADO'
      })
      
      console.log('Categorías filtradas (PRODUCTO_TERMINADO):', filteredCategories)
      console.log('Número de categorías filtradas:', filteredCategories.length)
      
      // Si no hay filtradas, mostrar todas para debug
      if (filteredCategories.length === 0) {
        console.warn('No se encontraron categorías de tipo PRODUCTO_TERMINADO')
        console.log('Tipos de categorías encontradas:', allCategories.map(c => ({ nombre: c.nombre, tipo: c.tipoProducto })))
      }
      
      setCategories(filteredCategories)
    } catch (err) {
      console.error('Error cargando categorías:', err)
      console.error('Detalles del error:', err.response?.data || err.message)
      console.error('Stack:', err.stack)
      setCategories([])
    }
  }

=======
>>>>>>> origin/main
  const loadProductBOM = async (productId) => {
    try {
      setLoading(true)
      const data = await productService.getProductById(productId)
      if (data.bom) {
        const bomWithItems = await productService.getBOMWithItems(data.bom.id)
        setBom(bomWithItems)
      } else {
        setBom(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await productService.createProduct(newProduct)
      await loadProducts()
      setShowCreateModal(false)
      setNewProduct({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
<<<<<<< HEAD
        categoriaId: null,
=======
>>>>>>> origin/main
        unidadMedida: 'un'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const handleDeleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Producto',
      message: '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setLoading(true)
          await productService.deleteProduct(id)
          if (selectedProduct?.id === id) {
            setSelectedProduct(null)
            setBom(null)
          }
          await loadProducts()
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: 'danger'
    })
=======
  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      setLoading(true)
      await productService.deleteProduct(id)
      if (selectedProduct?.id === id) {
        setSelectedProduct(null)
        setBom(null)
      }
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
>>>>>>> origin/main
  }

  const handleCreateBOM = async () => {
    if (!selectedProduct) return
    try {
      setLoading(true)
      setError('')
      await productService.createOrUpdateBOM(selectedProduct.id, {
        justificacion: ''
      })
      await loadProductBOM(selectedProduct.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!bom) {
      await handleCreateBOM()
      setTimeout(async () => {
        await loadProductBOM(selectedProduct.id)
        if (bom) {
          await addMaterialToBOM()
        }
      }, 500)
      return
    }
    await addMaterialToBOM()
  }

  const addMaterialToBOM = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!newMaterial.materialId || newMaterial.materialId === '') {
        setError('Debes seleccionar un material')
        setLoading(false)
        return
      }
      
      const materialId = parseInt(newMaterial.materialId)
      if (isNaN(materialId)) {
        setError('El ID del material no es válido')
        setLoading(false)
        return
      }
      
      await productService.addMaterialToBOM(bom.id, {
        materialId: materialId,
        cantidad: parseFloat(newMaterial.cantidad),
        unidad: newMaterial.unidad,
        porcentaje: newMaterial.porcentaje ? parseFloat(newMaterial.porcentaje) : 0
      })
      await loadProductBOM(selectedProduct.id)
      setShowAddMaterial(false)
      setNewMaterial({
        materialId: '',
        cantidad: '',
        unidad: 'mg',
        porcentaje: ''
      })
<<<<<<< HEAD
      // Si el modal de detalles está abierto, mantenerlo abierto
      if (showDetailsModal) {
        // El BOM ya se recargó arriba, no necesitamos hacer nada más
      }
=======
>>>>>>> origin/main
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const handleDeleteMaterial = (itemId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Material',
      message: '¿Estás seguro de eliminar este material de la lista?',
      onConfirm: async () => {
        try {
          setLoading(true)
          setError('')
          await productService.deleteBOMItem(itemId)
          await loadProductBOM(selectedProduct.id)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      type: 'danger'
    })
=======
  const handleDeleteMaterial = async (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este material de la lista?')) return
    try {
      setLoading(true)
      setError('')
      await productService.deleteBOMItem(itemId)
      await loadProductBOM(selectedProduct.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
>>>>>>> origin/main
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-danger">error</span>
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

<<<<<<< HEAD
      {/* Tabla de Productos Horizontal */}
      <div className="bg-card-dark rounded-lg border border-border-dark overflow-hidden mb-6">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-text-light font-semibold">Lista de Productos ({products.length})</h2>
        </div>
        {loading && !products.length ? (
          <div className="p-8 text-center text-text-muted">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
            <p className="text-sm">No hay productos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-input-dark/50 border-b border-border-dark">
                <tr>
                  <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Código</th>
                  <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Nombre</th>
                  <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Categoría</th>
                  <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Unidad</th>
                  <th className="px-3 py-2 text-center text-text-muted text-xs font-semibold uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-input-dark/30 transition-colors ${
                      selectedProduct?.id === product.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-text-light text-xs font-medium">{product.codigo}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span 
                        className="text-text-light text-xs cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.nombre}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-text-muted text-xs">{product.categoria || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-text-muted text-xs">{product.unidadMedida || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowDetailsModal(true)
                          }}
                          className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
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

      {/* Modal de Detalles del Producto */}
      {showDetailsModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false)
              setSelectedProduct(null)
              setBom(null)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-text-light text-2xl font-bold mb-2">{selectedProduct.nombre}</h2>
                  <p className="text-text-muted text-sm">{selectedProduct.codigo}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedProduct(null)
                    setBom(null)
                  }}
                  className="text-text-muted hover:text-text-light"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Detalles del Producto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-muted text-xs mb-1">Categoría</p>
                  <p className="text-text-light text-sm">{selectedProduct.categoria || 'Sin categoría'}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs mb-1">Unidad de Medida</p>
                  <p className="text-text-light text-sm">{selectedProduct.unidadMedida}</p>
                </div>
                {selectedProduct.descripcion && (
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs mb-1">Descripción</p>
                    <p className="text-text-light text-sm">{selectedProduct.descripcion}</p>
                  </div>
                )}
              </div>

              {/* Lista de Materiales (BOM) */}
              <div>
=======
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-card-dark border border-border-dark overflow-hidden">
            <div className="p-4 border-b border-border-dark">
              <h2 className="text-text-light font-semibold">Lista de Productos</h2>
            </div>
            {loading && !products.length ? (
              <div className="p-4 text-center text-text-muted">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-dark">
                      <th className="text-left p-3 text-text-muted text-xs font-semibold">Código</th>
                      <th className="text-left p-3 text-text-muted text-xs font-semibold">Nombre</th>
                      <th className="text-right p-3 text-text-muted text-xs font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-text-muted text-sm">
                          No hay productos registrados
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr 
                          key={product.id} 
                          className={`border-b border-border-dark hover:bg-border-dark/30 cursor-pointer ${
                            selectedProduct?.id === product.id ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <td className="p-3 text-text-light font-medium text-sm">{product.codigo}</td>
                          <td className="p-3 text-text-light text-sm">{product.nombre}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProduct(product.id)
                              }}
                              className="px-2 py-1 rounded text-xs text-danger hover:bg-danger/10"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedProduct ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-card-dark border border-border-dark p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-text-light text-2xl font-bold">{selectedProduct.nombre}</h2>
                    <p className="text-text-muted text-sm">{selectedProduct.codigo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted text-xs mb-1">Categoría</p>
                    <p className="text-text-light">{selectedProduct.categoria || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">Unidad de Medida</p>
                    <p className="text-text-light">{selectedProduct.unidadMedida}</p>
                  </div>
                  {selectedProduct.descripcion && (
                    <div className="col-span-2">
                      <p className="text-text-muted text-xs mb-1">Descripción</p>
                      <p className="text-text-light">{selectedProduct.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-card-dark border border-border-dark p-6">
>>>>>>> origin/main
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-text-light font-semibold">Lista de Materiales (BOM)</h3>
                  {bom ? (
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        bom.estado === 'APROBADO' ? 'bg-success/20 text-success' :
                        bom.estado === 'BORRADOR' ? 'bg-warning/20 text-warning' :
                        'bg-text-muted/20 text-text-muted'
                      }`}>
                        {bom.version} - {bom.estado}
                      </span>
                      <button
<<<<<<< HEAD
                        onClick={() => {
                          setShowAddMaterial(true)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
=======
                        onClick={() => setShowAddMaterial(true)}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
>>>>>>> origin/main
                        Agregar Material
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCreateBOM}
                      disabled={loading}
<<<<<<< HEAD
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
=======
                      className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
>>>>>>> origin/main
                    >
                      Crear BOM
                    </button>
                  )}
                </div>

                {bom && bom.items && bom.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
<<<<<<< HEAD
                      <thead className="bg-input-dark/50 border-b border-border-dark">
                        <tr>
                          <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Material</th>
                          <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Cantidad</th>
                          <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">Unidad</th>
                          <th className="px-3 py-2 text-left text-text-muted text-xs font-semibold uppercase tracking-wider">%</th>
                          <th className="px-3 py-2 text-center text-text-muted text-xs font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark">
                        {bom.items.map((item) => (
                          <tr key={item.id} className="hover:bg-input-dark/30 transition-colors">
                            <td className="px-3 py-2.5">
                              <span className="text-text-light text-xs font-medium">
                                {item.materialNombre || item.material?.nombre || `Material ${item.materialId || item.material_id}`}
                              </span>
                              {item.materialCodigo || item.material?.codigo ? (
                                <p className="text-text-muted text-xs">{item.materialCodigo || item.material?.codigo}</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-text-light text-xs">{item.cantidad}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-text-muted text-xs">{item.unidad}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-text-muted text-xs">{item.porcentaje}%</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => handleDeleteMaterial(item.id)}
                                  className="px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                                  title="Eliminar"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
=======
                      <thead>
                        <tr className="border-b border-border-dark">
                          <th className="text-left p-3 text-text-muted text-sm font-semibold">Material</th>
                          <th className="text-left p-3 text-text-muted text-sm font-semibold">Cantidad</th>
                          <th className="text-left p-3 text-text-muted text-sm font-semibold">Unidad</th>
                          <th className="text-left p-3 text-text-muted text-sm font-semibold">%</th>
                          <th className="text-right p-3 text-text-muted text-sm font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bom.items.map((item) => (
                          <tr key={item.id} className="border-b border-border-dark">
                            <td className="p-3 text-text-light">
                              {item.materialNombre || item.material?.nombre || `Material ${item.materialId || item.material_id}`}
                              <p className="text-text-muted text-xs">{item.materialCodigo || item.material?.codigo || ''}</p>
                            </td>
                            <td className="p-3 text-text-light">{item.cantidad}</td>
                            <td className="p-3 text-text-muted">{item.unidad}</td>
                            <td className="p-3 text-text-muted">{item.porcentaje}%</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteMaterial(item.id)}
                                className="text-danger hover:text-danger/80 text-sm"
                              >
                                Eliminar
                              </button>
>>>>>>> origin/main
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
<<<<<<< HEAD
                  <div className="text-center py-8 text-text-muted bg-input-dark rounded-lg border border-border-dark">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    <p className="text-sm">No hay materiales en la lista. Agrega materiales para crear la fórmula.</p>
=======
                  <div className="text-center py-8 text-text-muted">
                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                    <p>No hay materiales en la lista. Agrega materiales para crear la fórmula.</p>
>>>>>>> origin/main
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Botón Cerrar */}
              <div className="flex justify-end pt-4 border-t border-border-dark">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedProduct(null)
                    setBom(null)
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
=======
              {bom && (
                <div className="rounded-lg bg-card-dark border border-border-dark p-6">
                  <h3 className="text-text-light font-semibold mb-4">Justificación Técnica de Sinergia</h3>
                  <div className="p-4 rounded-lg bg-input-dark min-h-[100px]">
                    <p className="text-text-light text-sm leading-relaxed">
                      {bom.justificacion || 'Sin justificación técnica aún.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-card-dark border border-border-dark p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-text-muted mb-4">inventory_2</span>
              <p className="text-text-muted">Selecciona un producto para ver su lista de materiales</p>
            </div>
          )}
        </div>
      </div>
>>>>>>> origin/main

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Nuevo Producto</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Código *</label>
                <input
                  type="text"
                  required
                  value={newProduct.codigo}
                  onChange={(e) => setNewProduct({ ...newProduct, codigo: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Ej: PT-001"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={newProduct.descripcion}
                  onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Categoría</label>
<<<<<<< HEAD
                  <select
                    value={newProduct.categoriaId || ''}
                    onChange={(e) => {
                      const selectedCategory = categories.find(cat => cat.id === parseInt(e.target.value))
                      setNewProduct({ 
                        ...newProduct, 
                        categoriaId: e.target.value ? parseInt(e.target.value) : null,
                        categoria: selectedCategory ? selectedCategory.nombre : ''
                      })
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    disabled={categories.length === 0}
                  >
                    <option value="">
                      {categories.length === 0 ? 'Cargando categorías...' : 'Seleccionar categoría...'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-text-muted text-xs mt-1">
                      No hay categorías disponibles. Crea categorías en la sección de Categorías.
                    </p>
                  )}
=======
                  <input
                    type="text"
                    value={newProduct.categoria}
                    onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="Categoría"
                  />
>>>>>>> origin/main
                </div>
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Unidad de Medida</label>
                  <select
                    value={newProduct.unidadMedida}
                    onChange={(e) => setNewProduct({ ...newProduct, unidadMedida: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="un">Unidad (un)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="mg">Miligramo (mg)</option>
                    <option value="L">Litro (L)</option>
                    <option value="mL">Mililitro (mL)</option>
                  </select>
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
                  {loading ? 'Creando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-2xl w-full">
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-text-light text-xl font-semibold">Agregar Material al BOM</h2>
              <button
<<<<<<< HEAD
                onClick={() => {
                  setShowAddMaterial(false)
                }}
=======
                onClick={() => setShowAddMaterial(false)}
>>>>>>> origin/main
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-text-light text-sm font-medium mb-2">Material *</label>
                <select
                  required
                  value={newMaterial.materialId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, materialId: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Seleccionar material...</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nombre} ({material.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Cantidad *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newMaterial.cantidad}
                    onChange={(e) => setNewMaterial({ ...newMaterial, cantidad: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Unidad</label>
                  <select
                    value={newMaterial.unidad}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unidad: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="mL">mL</option>
                    <option value="L">L</option>
                    <option value="un">un</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">Porcentaje (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMaterial.porcentaje}
                    onChange={(e) => setNewMaterial({ ...newMaterial, porcentaje: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-input-dark text-text-light font-medium hover:bg-border-dark"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Agregando...' : 'Agregar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
<<<<<<< HEAD

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
=======
>>>>>>> origin/main
    </div>
  )
}

export default Productos

