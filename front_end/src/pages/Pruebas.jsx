import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'
import pruebaService from '../services/pruebaService'
import ideaService from '../services/ideaService'

const Pruebas = () => {
  const { user } = useAuth()
  const isAnalista = hasAnyRole(user, 'ANALISTA_LABORATORIO')
  
  const [pruebas, setPruebas] = useState([])
  const [loadingPruebas, setLoadingPruebas] = useState(false)
  const [selectedPrueba, setSelectedPrueba] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAddResultadoDialog, setShowAddResultadoDialog] = useState(false)
  const [ideasAsignadas, setIdeasAsignadas] = useState([])
  const [updatingEstado, setUpdatingEstado] = useState(false)
  
  // Formulario para nueva prueba
  const [nuevaPrueba, setNuevaPrueba] = useState({
    ideaId: '',
    codigoMuestra: '',
    tipoPrueba: '',
    descripcion: '',
    equiposUtilizados: '',
    pruebasRequeridas: ''
  })

  // Formulario para nuevo resultado
  const [nuevoResultado, setNuevoResultado] = useState({
    parametro: '',
    especificacion: '',
    resultado: '',
    unidad: '',
    cumpleEspecificacion: true,
    observaciones: ''
  })

  useEffect(() => {
    loadPruebas()
    if (isAnalista) {
      loadIdeasAsignadas()
    }
    
    // Verificar si hay un pruebaId en la URL para seleccionarla automáticamente
    const urlParams = new URLSearchParams(window.location.search)
    const pruebaId = urlParams.get('pruebaId')
    if (pruebaId) {
      // Esperar a que las pruebas se carguen
      setTimeout(async () => {
        try {
          const prueba = await pruebaService.getPruebaById(parseInt(pruebaId))
          setSelectedPrueba(prueba)
          // Limpiar la URL
          window.history.replaceState({}, '', '/pruebas')
        } catch (error) {
          console.error('Error al cargar prueba desde URL:', error)
        }
      }, 500)
    }
  }, [isAnalista])

  const loadPruebas = async () => {
    setLoadingPruebas(true)
    try {
      if (isAnalista) {
        const data = await pruebaService.getMisPruebas()
        // Filtrar solo pruebas activas:
        // 1. No completadas, no OOS, no rechazadas
        // 2. Y cuya idea asociada NO esté en estado PRUEBA_APROBADA
        // Las pruebas completadas o con ideas aprobadas se mostrarán en el Historial
        const pruebasActivas = data.filter(p => {
          const estadoPruebaActivo = p.estado !== 'COMPLETADA' && 
                                     p.estado !== 'OOS' && 
                                     p.estado !== 'RECHAZADA'
          const ideaNoAprobada = p.ideaEstado !== 'PRUEBA_APROBADA'
          return estadoPruebaActivo && ideaNoAprobada
        })
        setPruebas(pruebasActivas)
      } else {
        // Para otros roles, cargar todas las pruebas (implementar después)
        setPruebas([])
      }
    } catch (error) {
      console.error('Error al cargar pruebas:', error)
    } finally {
      setLoadingPruebas(false)
    }
  }

  const loadIdeasAsignadas = async () => {
    try {
      const ideas = await ideaService.getMisIdeas()
      // Solo ideas en estado EN_PRUEBA
      const ideasEnPrueba = ideas.filter(i => i.estado === 'EN_PRUEBA')
      setIdeasAsignadas(ideasEnPrueba)
    } catch (error) {
      console.error('Error al cargar ideas asignadas:', error)
    }
  }

  const handleCreatePrueba = async () => {
    if (!nuevaPrueba.ideaId || !nuevaPrueba.codigoMuestra || !nuevaPrueba.tipoPrueba) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      await pruebaService.createPrueba({
        ideaId: parseInt(nuevaPrueba.ideaId),
        codigoMuestra: nuevaPrueba.codigoMuestra,
        tipoPrueba: nuevaPrueba.tipoPrueba,
        descripcion: nuevaPrueba.descripcion,
        equiposUtilizados: nuevaPrueba.equiposUtilizados,
        pruebasRequeridas: nuevaPrueba.pruebasRequeridas,
        estado: 'PENDIENTE'
      })
      setShowCreateDialog(false)
      setNuevaPrueba({
        ideaId: '',
        codigoMuestra: '',
        tipoPrueba: '',
        descripcion: '',
        equiposUtilizados: '',
        pruebasRequeridas: ''
      })
      loadPruebas()
    } catch (error) {
      console.error('Error al crear prueba:', error)
      alert('Error al crear prueba: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleChangeEstado = async (nuevoEstado) => {
    if (!selectedPrueba) return
    
    setUpdatingEstado(true)
    try {
      const pruebaActualizada = await pruebaService.updatePrueba(selectedPrueba.id, {
        estado: nuevoEstado
      })
      // Actualizar la prueba seleccionada con los nuevos datos
      const pruebaCompleta = await pruebaService.getPruebaById(pruebaActualizada.id)
      setSelectedPrueba(pruebaCompleta)
      loadPruebas()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
    } finally {
      setUpdatingEstado(false)
    }
  }

  const handleAddResultado = async () => {
    if (!selectedPrueba || !nuevoResultado.parametro || !nuevoResultado.resultado) {
      alert('Por favor completa los campos requeridos (Parámetro y Resultado)')
      return
    }

    try {
      const pruebaActualizada = await pruebaService.addResultado(selectedPrueba.id, nuevoResultado)
      // Recargar la prueba completa para obtener los resultados actualizados
      const pruebaCompleta = await pruebaService.getPruebaById(pruebaActualizada.id)
      setSelectedPrueba(pruebaCompleta)
      
      // Evaluar automáticamente el estado de la prueba basado en los resultados
      // Solo cambiar a COMPLETADA si TODAS las pruebas requeridas tienen resultados
      if (pruebaCompleta.resultados && pruebaCompleta.resultados.length > 0 && pruebaCompleta.pruebasRequeridas) {
        const pruebasRequeridas = parsePruebasRequeridas(pruebaCompleta.pruebasRequeridas)
        
        // Verificar que todas las pruebas requeridas tengan resultados registrados
        const todasLasPruebasTienenResultados = pruebasRequeridas.every(pruebaReq => {
          return pruebaCompleta.resultados.some(resultado => {
            const parametroLower = resultado.parametro.toLowerCase().trim()
            const pruebaReqLower = pruebaReq.parametro.toLowerCase().trim()
            return parametroLower.includes(pruebaReqLower) || pruebaReqLower.includes(parametroLower)
          })
        })
        
        if (todasLasPruebasTienenResultados) {
          // Todas las pruebas requeridas tienen resultados, ahora evaluar cumplimiento
          const todosCumplen = pruebaCompleta.resultados.every(r => r.cumpleEspecificacion !== false)
          const hayOOS = pruebaCompleta.resultados.some(r => r.cumpleEspecificacion === false)
          
          // Solo cambiar estado si todas las pruebas requeridas están completas
          if (todosCumplen && pruebaCompleta.estado === 'EN_PROCESO') {
            await pruebaService.updatePrueba(pruebaCompleta.id, { estado: 'COMPLETADA' })
            const pruebaActualizadaEstado = await pruebaService.getPruebaById(pruebaCompleta.id)
            setSelectedPrueba(pruebaActualizadaEstado)
            loadPruebas()
            // El backend sincronizará automáticamente el estado de la idea
            // Recargar ideas asignadas si es analista para reflejar el cambio de estado
            if (isAnalista) {
              loadIdeasAsignadas()
            }
          } else if (hayOOS && pruebaCompleta.estado === 'EN_PROCESO') {
            await pruebaService.updatePrueba(pruebaCompleta.id, { estado: 'OOS' })
            const pruebaActualizadaEstado = await pruebaService.getPruebaById(pruebaCompleta.id)
            setSelectedPrueba(pruebaActualizadaEstado)
            loadPruebas()
            // El backend sincronizará automáticamente el estado de la idea
            // Recargar ideas asignadas si es analista para reflejar el cambio de estado
            if (isAnalista) {
              loadIdeasAsignadas()
            }
          }
        }
        // Si no todas las pruebas requeridas tienen resultados, mantener EN_PROCESO
      }
      
      setShowAddResultadoDialog(false)
      setNuevoResultado({
        parametro: '',
        especificacion: '',
        resultado: '',
        unidad: '',
        cumpleEspecificacion: true,
        observaciones: ''
      })
    } catch (error) {
      console.error('Error al agregar resultado:', error)
      alert('Error al agregar resultado: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleVerDetalle = async (prueba) => {
    try {
      // Cargar la prueba completa con todos sus resultados
      const pruebaCompleta = await pruebaService.getPruebaById(prueba.id)
      setSelectedPrueba(pruebaCompleta)
    } catch (error) {
      console.error('Error al cargar detalle:', error)
      setSelectedPrueba(prueba)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-warning/20 text-warning'
      case 'en_proceso':
        return 'bg-primary/20 text-primary'
      case 'completada':
        return 'bg-success/20 text-success'
      case 'oos':
        return 'bg-danger/20 text-danger'
      case 'rechazada':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente'
      case 'en_proceso':
        return 'En Proceso'
      case 'completada':
        return 'Completada'
      case 'oos':
        return 'OOS'
      case 'rechazada':
        return 'Rechazada'
      default:
        return estado || 'N/A'
    }
  }

  // Función para parsear las pruebas requeridas y extraer parámetros con especificaciones
  const parsePruebasRequeridas = (texto) => {
    if (!texto) return []
    
    const pruebas = []
    const lineas = texto.split('\n')
    
    lineas.forEach(linea => {
      linea = linea.trim()
      if (!linea || !linea.startsWith('-')) return
      
      // Buscar patrón: "- Parámetro (especificación: valor)"
      const match = linea.match(/^-\s*(.+?)\s*\([^:]*:\s*(.+?)\)/i)
      if (match) {
        const parametro = match[1].trim()
        const especificacion = match[2].trim()
        pruebas.push({ parametro, especificacion })
      } else {
        // Si no tiene especificación, solo extraer el parámetro
        const parametro = linea.replace(/^-\s*/, '').trim()
        if (parametro) {
          pruebas.push({ parametro, especificacion: null })
        }
      }
    })
    
    return pruebas
  }

  // Función para comparar un resultado con una especificación
  const evaluarCumplimiento = (resultado, especificacion) => {
    if (!resultado || !especificacion) return null
    
    // Extraer número del resultado (ignorar unidades)
    const resultadoNum = parseFloat(resultado.toString().replace(/[^\d.-]/g, ''))
    if (isNaN(resultadoNum)) return null // Si no es numérico, no se puede evaluar
    
    // Evaluar diferentes tipos de especificaciones
    const espec = especificacion.trim()
    
    // Rango: "6.5 - 7.5" o "6.5-7.5"
    const rangoMatch = espec.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/)
    if (rangoMatch) {
      const min = parseFloat(rangoMatch[1])
      const max = parseFloat(rangoMatch[2])
      return resultadoNum >= min && resultadoNum <= max
    }
    
    // Menor o igual: "≤ 5" o "<= 5" o "≤5%"
    const menorIgualMatch = espec.match(/≤|<=/i)
    if (menorIgualMatch) {
      const valor = parseFloat(espec.replace(/[^\d.-]/g, ''))
      if (!isNaN(valor)) {
        return resultadoNum <= valor
      }
    }
    
    // Mayor o igual: "≥ 80" o ">= 80" o "≥80%"
    const mayorIgualMatch = espec.match(/≥|>=/i)
    if (mayorIgualMatch) {
      const valor = parseFloat(espec.replace(/[^\d.-]/g, ''))
      if (!isNaN(valor)) {
        return resultadoNum >= valor
      }
    }
    
    // Menor que: "< 5" o "<5%"
    const menorMatch = espec.match(/<\s*(\d+\.?\d*)/)
    if (menorMatch) {
      const valor = parseFloat(menorMatch[1])
      return resultadoNum < valor
    }
    
    // Mayor que: "> 80" o ">80%"
    const mayorMatch = espec.match(/>\s*(\d+\.?\d*)/)
    if (mayorMatch) {
      const valor = parseFloat(mayorMatch[1])
      return resultadoNum > valor
    }
    
    // Igual: "= 7" o "7"
    const igualMatch = espec.match(/=\s*(\d+\.?\d*)|^(\d+\.?\d*)$/)
    if (igualMatch) {
      const valor = parseFloat(igualMatch[1] || igualMatch[2])
      return Math.abs(resultadoNum - valor) < 0.01 // Tolerancia para comparación de flotantes
    }
    
    return null // No se pudo evaluar
  }

  // Función para detectar parámetro y auto-completar especificación
  const detectarParametro = (parametroIngresado) => {
    if (!selectedPrueba?.pruebasRequeridas || !parametroIngresado) return null
    
    const pruebasRequeridas = parsePruebasRequeridas(selectedPrueba.pruebasRequeridas)
    const parametroLower = parametroIngresado.toLowerCase().trim()
    
    // Buscar coincidencia exacta o parcial
    const coincidencia = pruebasRequeridas.find(p => 
      p.parametro.toLowerCase().includes(parametroLower) || 
      parametroLower.includes(p.parametro.toLowerCase())
    )
    
    return coincidencia || null
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Pruebas / Control de Calidad (LIMS)</h1>
          <p className="text-text-muted text-sm mt-1">
            {isAnalista 
              ? 'Pruebas de laboratorio vinculadas a ideas asignadas' 
              : 'Trazabilidad completa de muestras y resultados analíticos'}
          </p>
        </div>
        {isAnalista && ideasAsignadas.length > 0 && (
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 flex items-center gap-2"
          >
          <span className="material-symbols-outlined">add</span>
            Nueva Prueba
        </button>
        )}
      </div>

      {/* Alertas OOS - Solo si hay pruebas OOS */}
      {pruebas.filter(p => p.estado === 'OOS').length > 0 && (
      <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-danger text-2xl">error</span>
        <div className="flex-1">
            <p className="text-text-light font-semibold">
              {pruebas.filter(p => p.estado === 'OOS').length} Resultado{pruebas.filter(p => p.estado === 'OOS').length === 1 ? '' : 's'} Fuera de Especificación (OOS)
            </p>
          <p className="text-text-muted text-sm">Requieren investigación y documentación</p>
          </div>
        </div>
      )}

      {/* Lista de Pruebas */}
      <div className="rounded-lg bg-card-dark border border-border-dark mb-6">
        <div className="p-4 border-b border-border-dark">
          <h2 className="text-text-light font-semibold">
            {isAnalista ? 'Mis Pruebas' : 'Pruebas en Análisis'}
          </h2>
        </div>
        {loadingPruebas ? (
          <div className="p-6 text-center">
            <p className="text-text-muted text-sm">Cargando pruebas...</p>
          </div>
        ) : pruebas.length === 0 ? (
          <div className="p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">science</span>
            <p className="text-text-muted text-sm">
              {isAnalista 
                ? 'No tienes pruebas asignadas. Crea una nueva prueba desde una idea asignada.' 
                : 'No hay pruebas disponibles'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Código Muestra</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Idea</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Tipo Prueba</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Estado</th>
                  <th className="text-left p-4 text-text-muted text-sm font-semibold">Fecha Muestreo</th>
                  <th className="text-right p-4 text-text-muted text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pruebas.map((prueba) => (
                  <tr key={prueba.id} className="border-b border-border-dark hover:bg-border-dark/50">
                    <td className="p-4 text-text-light font-medium">{prueba.codigoMuestra}</td>
                    <td className="p-4 text-text-muted text-sm">
                      {prueba.ideaId ? `Idea #${prueba.ideaId}` : 'N/A'}
                    </td>
                    <td className="p-4 text-text-muted text-sm">{prueba.tipoPrueba}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getEstadoColor(prueba.estado)}`}>
                        {getEstadoLabel(prueba.estado)}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted text-sm">
                      {prueba.fechaMuestreo ? new Date(prueba.fechaMuestreo).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleVerDetalle(prueba)}
                        className="px-3 py-1 rounded bg-primary/20 text-primary text-sm hover:bg-primary/30"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle de Prueba */}
      {selectedPrueba && (
        <div className="rounded-lg bg-card-dark border border-border-dark p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-text-light text-2xl font-bold">{selectedPrueba.codigoMuestra}</h2>
              <p className="text-text-muted text-sm">{selectedPrueba.tipoPrueba}</p>
            </div>
            <button
              onClick={() => setSelectedPrueba(null)}
              className="text-text-muted hover:text-text-light"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Acciones de Estado - Solo para analistas */}
          {isAnalista && (
            <div className="mb-6 p-4 rounded-lg bg-input-dark border border-border-dark">
              <h3 className="text-text-light font-semibold mb-4">Acciones</h3>
              <div className="flex flex-wrap gap-3">
                {selectedPrueba.estado === 'PENDIENTE' && (
                  <button
                    onClick={() => handleChangeEstado('EN_PROCESO')}
                    disabled={updatingEstado}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Iniciar Prueba
                  </button>
                )}
                {selectedPrueba.estado === 'EN_PROCESO' && (
                  <>
                    <button
                      onClick={() => handleChangeEstado('COMPLETADA')}
                      disabled={updatingEstado}
                      className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completar Prueba
                    </button>
                    <button
                      onClick={() => handleChangeEstado('OOS')}
                      disabled={updatingEstado}
                      className="px-4 py-2 rounded-lg bg-warning text-white text-sm font-medium hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      Marcar como OOS
                    </button>
                    <button
                      onClick={() => handleChangeEstado('RECHAZADA')}
                      disabled={updatingEstado}
                      className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Rechazar Prueba
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Información de la Prueba */}
          <div className="mb-6">
            <h3 className="text-text-light font-semibold mb-4">Información de la Prueba</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                <p className="text-text-muted text-xs mb-1">Estado</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${getEstadoColor(selectedPrueba.estado)}`}>
                  {getEstadoLabel(selectedPrueba.estado)}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                <p className="text-text-muted text-xs mb-1">Idea Asociada</p>
                <p className="text-text-light">Idea #{selectedPrueba.ideaId}</p>
              </div>
              {selectedPrueba.fechaMuestreo && (
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-muted text-xs mb-1">Fecha de Muestreo</p>
                  <p className="text-text-light">{new Date(selectedPrueba.fechaMuestreo).toLocaleString('es-ES')}</p>
                </div>
              )}
              {selectedPrueba.equiposUtilizados && (
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-muted text-xs mb-1">Equipos Utilizados</p>
                  <p className="text-text-light">{selectedPrueba.equiposUtilizados}</p>
                </div>
              )}
              {selectedPrueba.descripcion && (
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-muted text-xs mb-1">Descripción</p>
                  <p className="text-text-light">{selectedPrueba.descripcion}</p>
                </div>
              )}
              {selectedPrueba.pruebasRequeridas && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="material-symbols-outlined text-primary text-lg">assignment</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-text-light font-semibold">Pruebas Requeridas y Resultados</p>
                          {isAnalista && selectedPrueba.estado === 'EN_PROCESO' && (
                            <button
                              onClick={() => setShowAddResultadoDialog(true)}
                              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              Agregar Resultado
                            </button>
                          )}
                        </div>
                        <p className="text-text-muted text-xs mb-3">Lista de pruebas que debes realizar y sus resultados:</p>
                        <div className="space-y-2">
                          {parsePruebasRequeridas(selectedPrueba.pruebasRequeridas).map((prueba, index) => {
                            // Verificar si ya se registró un resultado para este parámetro
                            const resultadoRegistrado = selectedPrueba.resultados?.find(r => 
                              r.parametro.toLowerCase().includes(prueba.parametro.toLowerCase()) ||
                              prueba.parametro.toLowerCase().includes(r.parametro.toLowerCase())
                            )
                            
                            return (
                              <div 
                                key={index} 
                                className={`p-4 rounded-lg border ${
                                  resultadoRegistrado 
                                    ? resultadoRegistrado.cumpleEspecificacion === false
                                      ? 'bg-danger/10 border-danger/30'
                                      : 'bg-success/10 border-success/30'
                                    : 'bg-input-dark border-border-dark'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-text-light font-medium text-sm">{prueba.parametro}</p>
                                    {prueba.especificacion && (
                                      <p className="text-text-muted text-xs mt-1">
                                        Especificación: <span className="text-text-light">{prueba.especificacion}</span>
                                      </p>
                                    )}
                                  </div>
                                  {resultadoRegistrado ? (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      resultadoRegistrado.cumpleEspecificacion === false
                                        ? 'bg-danger/20 text-danger'
                                        : 'bg-success/20 text-success'
                                    }`}>
                                      {resultadoRegistrado.cumpleEspecificacion === false ? '✗ OOS' : '✓ Cumple'}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded text-xs bg-warning/20 text-warning font-medium">
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                                
                                {/* Mostrar resultado si está registrado */}
                                {resultadoRegistrado && (
                                  <div className="mt-3 pt-3 border-t border-border-dark">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-text-light font-semibold text-sm">
                                          Resultado: <span className="text-primary">{resultadoRegistrado.resultado}</span> {resultadoRegistrado.unidad || ''}
                                        </p>
                                        {resultadoRegistrado.observaciones && (
                                          <p className="text-text-muted text-xs mt-1 italic">
                                            {resultadoRegistrado.observaciones}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Diálogo para agregar resultado */}
      {showAddResultadoDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddResultadoDialog(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-5xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-text-light text-xl font-semibold mb-1">Agregar Resultado Analítico</h3>
                  <p className="text-text-muted text-sm">Registra los resultados de los análisis de laboratorio para esta prueba</p>
                </div>
                <button
                  onClick={() => setShowAddResultadoDialog(false)}
                  className="text-text-muted hover:text-text-light transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Información de la Prueba */}
                <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-muted text-xs mb-2">Prueba Asociada</p>
                  <div className="grid grid-cols-2 gap-4">
          <div>
                      <p className="text-text-light font-medium">{selectedPrueba?.codigoMuestra}</p>
                      <p className="text-text-muted text-xs">{selectedPrueba?.tipoPrueba}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs">Idea #{selectedPrueba?.ideaId}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de pruebas requeridas para selección rápida */}
                {selectedPrueba?.pruebasRequeridas && parsePruebasRequeridas(selectedPrueba.pruebasRequeridas).length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-text-light text-sm font-medium mb-3">Selecciona un parámetro de la lista:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {parsePruebasRequeridas(selectedPrueba.pruebasRequeridas).map((prueba, index) => {
                        const yaRegistrado = selectedPrueba.resultados?.some(r => 
                          r.parametro.toLowerCase().includes(prueba.parametro.toLowerCase()) ||
                          prueba.parametro.toLowerCase().includes(r.parametro.toLowerCase())
                        )
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setNuevoResultado({
                                ...nuevoResultado,
                                parametro: prueba.parametro,
                                especificacion: prueba.especificacion || ''
                              })
                            }}
                            disabled={yaRegistrado}
                            className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                              yaRegistrado
                                ? 'bg-input-dark/50 border-border-dark text-text-muted cursor-not-allowed'
                                : nuevoResultado.parametro.toLowerCase() === prueba.parametro.toLowerCase()
                                ? 'bg-primary/20 border-primary/50 text-text-light'
                                : 'bg-input-dark border-border-dark text-text-light hover:bg-border-dark'
                            }`}
                          >
                            <p className="font-medium">{prueba.parametro}</p>
                            {prueba.especificacion && (
                              <p className="text-xs text-text-muted mt-0.5">{prueba.especificacion}</p>
                            )}
                            {yaRegistrado && (
                              <p className="text-xs text-warning mt-1">✓ Ya registrado</p>
                            )}
                      </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Campos principales en grid horizontal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-light text-sm font-medium mb-2">
                      Parámetro Analizado <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={nuevoResultado.parametro}
                      onChange={(e) => {
                        const parametro = e.target.value
                        const detectado = detectarParametro(parametro)
                        setNuevoResultado({ 
                          ...nuevoResultado, 
                          parametro,
                          especificacion: detectado?.especificacion || nuevoResultado.especificacion
                        })
                      }}
                      placeholder="Ej: pH, Humedad, Proteína, Grasa, Cenizas"
                      className="w-full h-11 px-4 rounded-lg bg-input-dark border border-border-dark text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                    <p className="text-text-muted text-xs mt-1">Nombre del parámetro que se está analizando</p>
                  </div>

                  <div>
                    <label className="block text-text-light text-sm font-medium mb-2">
                      Especificación
                    </label>
                    <input
                      type="text"
                      value={nuevoResultado.especificacion}
                      onChange={(e) => {
                        const especificacion = e.target.value
                        setNuevoResultado({ ...nuevoResultado, especificacion })
                        // Re-evaluar cumplimiento si hay resultado
                        if (nuevoResultado.resultado) {
                          const cumple = evaluarCumplimiento(nuevoResultado.resultado, especificacion)
                          if (cumple !== null) {
                            setNuevoResultado(prev => ({ ...prev, especificacion, cumpleEspecificacion: cumple }))
                          }
                        }
                      }}
                      placeholder="Ej: 6.5 - 7.5, ≤ 5%, ≥ 80%"
                      className="w-full h-11 px-4 rounded-lg bg-input-dark border border-border-dark text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                    <p className="text-text-muted text-xs mt-1">Rango o límite aceptable según especificaciones</p>
                  </div>
                </div>

                {/* Resultado y Unidad en grid horizontal */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-text-light text-sm font-medium mb-2">
                      Resultado Obtenido <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={nuevoResultado.resultado}
                      onChange={(e) => {
                        const resultado = e.target.value
                        // Si hay especificación, evaluar automáticamente
                        let cumpleEspecificacion = nuevoResultado.cumpleEspecificacion
                        if (nuevoResultado.especificacion && resultado) {
                          const evaluacion = evaluarCumplimiento(resultado, nuevoResultado.especificacion)
                          if (evaluacion !== null) {
                            cumpleEspecificacion = evaluacion
                          }
                        }
                        setNuevoResultado({ ...nuevoResultado, resultado, cumpleEspecificacion })
                      }}
                      placeholder="Ej: 7.2, 4.5, 82.3"
                      className="w-full h-11 px-4 rounded-lg bg-input-dark border border-border-dark text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                    <p className="text-text-muted text-xs mt-1">Valor numérico o cualitativo obtenido en el análisis</p>
                    {nuevoResultado.especificacion && nuevoResultado.resultado && evaluarCumplimiento(nuevoResultado.resultado, nuevoResultado.especificacion) !== null && (
                      <p className={`text-xs mt-1 font-medium ${
                        nuevoResultado.cumpleEspecificacion ? 'text-success' : 'text-danger'
                      }`}>
                        {nuevoResultado.cumpleEspecificacion ? '✓ Cumple con la especificación' : '✗ No cumple con la especificación (OOS)'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-text-light text-sm font-medium mb-2">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      value={nuevoResultado.unidad}
                      onChange={(e) => setNuevoResultado({ ...nuevoResultado, unidad: e.target.value })}
                      placeholder="Ej: %, mg/L, g/100g, pH"
                      className="w-full h-11 px-4 rounded-lg bg-input-dark border border-border-dark text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                    <p className="text-text-muted text-xs mt-1">Unidad del resultado</p>
                  </div>
                </div>

                {/* Estado de cumplimiento - Calculado automáticamente */}
                {nuevoResultado.especificacion && nuevoResultado.resultado && evaluarCumplimiento(nuevoResultado.resultado, nuevoResultado.especificacion) !== null ? (
                  <div className={`p-4 rounded-lg border ${
                    nuevoResultado.cumpleEspecificacion 
                      ? 'bg-success/10 border-success/30' 
                      : 'bg-danger/10 border-danger/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-xl ${
                        nuevoResultado.cumpleEspecificacion ? 'text-success' : 'text-danger'
                      }`}>
                        {nuevoResultado.cumpleEspecificacion ? 'check_circle' : 'error'}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          nuevoResultado.cumpleEspecificacion ? 'text-success' : 'text-danger'
                        }`}>
                          {nuevoResultado.cumpleEspecificacion ? '✓ Cumple con la especificación' : '✗ No cumple con la especificación (OOS)'}
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          {nuevoResultado.cumpleEspecificacion 
                            ? 'El resultado está dentro del rango aceptable según la especificación' 
                            : 'El resultado está fuera de especificación. Requiere investigación.'}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nuevoResultado.cumpleEspecificacion}
                        onChange={(e) => setNuevoResultado({ ...nuevoResultado, cumpleEspecificacion: e.target.checked })}
                        className="w-4 h-4 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-text-muted text-xs">Puedes ajustar manualmente si es necesario</span>
                    </label>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-input-dark border border-border-dark">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nuevoResultado.cumpleEspecificacion}
                        onChange={(e) => setNuevoResultado({ ...nuevoResultado, cumpleEspecificacion: e.target.checked })}
                        className="w-5 h-5 rounded border-border-dark bg-card-dark text-primary focus:ring-2 focus:ring-primary/50"
                      />
                      <div>
                        <span className="text-text-light text-sm font-medium">Cumple con la especificación</span>
                        <p className="text-text-muted text-xs mt-0.5">
                          {nuevoResultado.cumpleEspecificacion 
                            ? 'El resultado está dentro del rango aceptable' 
                            : 'El resultado está fuera de especificación (OOS)'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Observaciones */}
                <div>
                  <label className="block text-text-light text-sm font-medium mb-2">
                    Observaciones y Notas
                  </label>
                  <textarea
                    value={nuevoResultado.observaciones}
                    onChange={(e) => setNuevoResultado({ ...nuevoResultado, observaciones: e.target.value })}
                    placeholder="Agrega observaciones adicionales, condiciones del análisis, desviaciones, metodología utilizada, etc."
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg bg-input-dark border border-border-dark text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
                  />
                  <p className="text-text-muted text-xs mt-1">Información adicional relevante sobre el resultado del análisis</p>
                </div>

                {/* Resumen del resultado */}
                {nuevoResultado.parametro && nuevoResultado.resultado && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-text-muted text-xs mb-2">Resumen del Resultado:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-text-light font-medium">
                        {nuevoResultado.parametro}: {nuevoResultado.resultado} {nuevoResultado.unidad || ''}
                      </span>
                      {nuevoResultado.especificacion && (
                        <span className="text-text-muted text-sm">
                          (Especificación: {nuevoResultado.especificacion})
                        </span>
                      )}
                      <span className={`ml-auto px-2 py-1 rounded text-xs ${
                        nuevoResultado.cumpleEspecificacion 
                          ? 'bg-success/20 text-success' 
                          : 'bg-danger/20 text-danger'
                      }`}>
                        {nuevoResultado.cumpleEspecificacion ? '✓ Cumple' : '✗ OOS'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border-dark">
                <button
                  onClick={() => {
                    setShowAddResultadoDialog(false)
                    setNuevoResultado({
                      parametro: '',
                      especificacion: '',
                      resultado: '',
                      unidad: '',
                      cumpleEspecificacion: true,
                      observaciones: ''
                    })
                  }}
                  className="px-6 py-2.5 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddResultado}
                  disabled={!nuevoResultado.parametro || !nuevoResultado.resultado}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Agregar Resultado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para crear nueva prueba */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateDialog(false)
            }
          }}
        >
          <div className="bg-card-dark rounded-lg border border-border-dark max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-text-light text-lg font-semibold">Nueva Prueba</h3>
              <button
                  onClick={() => setShowCreateDialog(false)}
                className="text-text-muted hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-text-muted text-sm mb-2">Idea Asociada *</label>
                  <select
                    value={nuevaPrueba.ideaId}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, ideaId: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecciona una idea</option>
                    {ideasAsignadas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.titulo} (ID: {idea.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted text-sm mb-2">Código de Muestra *</label>
                  <input
                    type="text"
                    value={nuevaPrueba.codigoMuestra}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, codigoMuestra: e.target.value })}
                    placeholder="Ej: MU-2024-001"
                    className="w-full h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-muted text-sm mb-2">Tipo de Prueba *</label>
                  <input
                    type="text"
                    value={nuevaPrueba.tipoPrueba}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, tipoPrueba: e.target.value })}
                    placeholder="Ej: Control de Calidad, Análisis Sensorial"
                    className="w-full h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-muted text-sm mb-2">Descripción</label>
                  <textarea
                    value={nuevaPrueba.descripcion}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, descripcion: e.target.value })}
                    placeholder="Descripción de la prueba..."
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-muted text-sm mb-2">Equipos Utilizados</label>
                  <input
                    type="text"
                    value={nuevaPrueba.equiposUtilizados}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, equiposUtilizados: e.target.value })}
                    placeholder="Ej: HPLC-001, BAL-002"
                    className="w-full h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-text-muted text-sm mb-2">Pruebas Requeridas</label>
                  <textarea
                    value={nuevaPrueba.pruebasRequeridas}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, pruebasRequeridas: e.target.value })}
                    placeholder="Especifica qué pruebas debe realizar. Ejemplo:&#10;- pH (especificación: 6.5 - 7.5)&#10;- Humedad (especificación: ≤ 5%)&#10;- Proteína (especificación: ≥ 80%)"
                    rows="5"
                    className="w-full px-4 py-2 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-text-muted text-xs mt-1">
                    Lista de los parámetros y pruebas que se deben realizar
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePrueba}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Crear Prueba
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pruebas

