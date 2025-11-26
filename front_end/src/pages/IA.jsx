<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import productService from '../services/productService'
import ideaService from '../services/ideaService'

const IA = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [objetivo, setObjetivo] = useState('')
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [generatedIdeas, setGeneratedIdeas] = useState([])

  // Verificar que solo Supervisor QA y Administrador puedan acceder
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
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({})
      setProducts(data)
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  const handleGenerateIdeas = async () => {
    if (!selectedProduct) {
      setMessage({ type: 'error', text: 'Debes seleccionar un producto del inventario' })
      return
    }

    if (!objetivo.trim()) {
      setMessage({ type: 'error', text: 'Debes especificar qué quieres lograr (ej: "quiero crear una proteína para diabéticos")' })
      return
    }

    setGenerating(true)
    setMessage({ type: '', text: '' })

    try {
      // Llamar al endpoint que usa OpenAI para generar la idea
      const ideaGuardada = await ideaService.generateFromProduct(selectedProduct.id, objetivo)
      setGeneratedIdeas([ideaGuardada])
      setMessage({ type: 'success', text: 'Idea generada exitosamente con IA. Revisa el módulo de Ideas para ver los detalles completos, incluyendo el BOM modificado y escenarios.' })
      
      // Limpiar formulario
      setSelectedProduct(null)
      setObjetivo('')

      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)

    } catch (error) {
      console.error('Error generando ideas:', error)
      setMessage({ type: 'error', text: error.message || 'Error al generar ideas. Por favor, intente nuevamente.' })
    } finally {
      setGenerating(false)
    }
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

      {/* Generación de Ideas con IA */}
      <div className="rounded-lg bg-card-dark border border-border-dark p-6 mb-6">
        <h2 className="text-text-light text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">auto_awesome</span>
          Generar Nuevas Fórmulas con IA
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
            {selectedProduct && (
              <div className="mt-2 p-3 rounded-lg bg-input-dark border border-border-dark">
                <p className="text-text-light text-sm font-medium">{selectedProduct.nombre}</p>
                <p className="text-text-muted text-xs mt-1">{selectedProduct.descripcion || 'Sin descripción'}</p>
                <p className="text-text-muted text-xs mt-1">Categoría: {selectedProduct.categoria || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-text-light text-sm font-medium mb-2">
              ¿Qué quieres lograr? <span className="text-text-muted">(Objetivo)</span>
            </label>
            <textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              rows={3}
              placeholder='Ejemplo: "quiero crear una proteína para diabéticos" o "necesito un suplemento para mejorar la recuperación muscular"'
              className="w-full px-4 py-3 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-text-muted text-xs mt-2">
              Describe claramente el objetivo o necesidad que quieres cumplir con la nueva fórmula.
            </p>
          </div>

          <button
            onClick={handleGenerateIdeas}
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

        {generating && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              <div>
                <p className="text-text-light font-medium">Analizando producto...</p>
                <p className="text-text-muted text-sm mt-1">
                  La IA está analizando el BOM completo de "{selectedProduct?.nombre}" y generando fórmulas sugeridas basadas en tu objetivo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

=======
const IA = () => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">IA / Simulación</h1>
          <p className="text-text-muted text-sm mt-1">Extracción eficiente de datos y predicción de parámetros fisicoquímicos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extracción de Datos */}
        <div className="rounded-lg bg-card-dark border border-border-dark p-6">
          <h2 className="text-text-light text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Extracción Eficiente de Datos
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Herramientas de IA para extraer y procesar información de documentos científicos,
            especificaciones técnicas y literatura especializada.
          </p>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 flex items-center justify-between">
              <span>Extraer de PDFs Científicos</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 flex items-center justify-between">
              <span>Procesar Especificaciones Técnicas</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 flex items-center justify-between">
              <span>Análisis de Literatura</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Predicción de Parámetros */}
        <div className="rounded-lg bg-card-dark border border-border-dark p-6">
          <h2 className="text-text-light text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">psychology</span>
            Predicción de Parámetros Fisicoquímicos
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Modelos predictivos para estimar propiedades como solubilidad, estabilidad,
            compatibilidad y biodisponibilidad.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">Ingrediente</label>
              <input
                type="text"
                placeholder="Nombre o fórmula molecular"
                className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">Parámetros a Predecir</label>
              <div className="space-y-2">
                {['Solubilidad', 'LogP', 'Estabilidad', 'Biodisponibilidad', 'Compatibilidad'].map((param) => (
                  <label key={param} className="flex items-center gap-2 p-2 rounded-lg bg-input-dark cursor-pointer hover:bg-border-dark/50">
                    <input type="checkbox" className="w-4 h-4 rounded border-border-dark bg-card-dark text-primary" />
                    <span className="text-text-light text-sm">{param}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
              Ejecutar Predicción
            </button>
          </div>
        </div>
      </div>

      {/* Resultados Recientes */}
      <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
        <h2 className="text-text-light text-xl font-semibold mb-4">Resultados Recientes</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 rounded-lg bg-input-dark border border-border-dark">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-text-light font-medium">Análisis de Colecalciferol</p>
                  <p className="text-text-muted text-xs">Ejecutado: 17/01/2024 14:30</p>
                </div>
                <span className="px-2 py-1 rounded bg-success/20 text-success text-xs">Completado</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-text-muted text-xs">LogP Predicho</p>
                  <p className="text-text-light font-medium">8.5</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Solubilidad</p>
                  <p className="text-text-light font-medium">Insoluble</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Estabilidad</p>
                  <p className="text-text-light font-medium">Alta</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Confianza</p>
                  <p className="text-text-light font-medium">92%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
>>>>>>> origin/main
    </div>
  )
}

export default IA
<<<<<<< HEAD
=======

>>>>>>> origin/main
