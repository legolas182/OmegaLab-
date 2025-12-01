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

  // Función para agregar resultado de checklist directamente (Sí/No)
  const handleAgregarResultadoChecklist = async (parametro, especificacion, valor) => {
    if (!selectedPrueba) return
    
    const ahora = new Date()
    const fechaHora = ahora.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    const resultadoChecklist = {
      parametro: parametro,
      especificacion: especificacion || '',
      resultado: valor === 'si' ? 'Sí' : 'No',
      unidad: '',
      tipoResultado: 'checklist',
      valorChecklist: valor,
      cumpleEspecificacion: valor === 'si',
      observaciones: `Registrado el ${fechaHora}`
    }
    
    try {
      const pruebaActualizada = await pruebaService.addResultado(selectedPrueba.id, resultadoChecklist)
      // Recargar la prueba completa para obtener los resultados actualizados
      const pruebaCompleta = await pruebaService.getPruebaById(pruebaActualizada.id)
      setSelectedPrueba(pruebaCompleta)
      loadPruebas()
      
      // Evaluar automáticamente el estado de la prueba basado en los resultados
      await evaluarEstadoPrueba(pruebaCompleta)
    } catch (error) {
      console.error('Error al agregar resultado de checklist:', error)
      alert('Error al agregar resultado: ' + (error.message || 'Error desconocido'))
    }
  }

  // Función auxiliar para evaluar el estado de la prueba
  const evaluarEstadoPrueba = async (pruebaCompleta) => {
    if (!pruebaCompleta.resultados || pruebaCompleta.resultados.length === 0 || !pruebaCompleta.pruebasRequeridas) {
      return
    }
    
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
        if (isAnalista) {
          loadIdeasAsignadas()
        }
      } else if (hayOOS && pruebaCompleta.estado === 'EN_PROCESO') {
        await pruebaService.updatePrueba(pruebaCompleta.id, { estado: 'OOS' })
        const pruebaActualizadaEstado = await pruebaService.getPruebaById(pruebaCompleta.id)
        setSelectedPrueba(pruebaActualizadaEstado)
        loadPruebas()
        if (isAnalista) {
          loadIdeasAsignadas()
        }
      }
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
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
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
                                    <div className="flex flex-col items-end gap-1">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        resultadoRegistrado.cumpleEspecificacion === false
                                          ? 'bg-danger/20 text-danger'
                                          : 'bg-success/20 text-success'
                                      }`}>
                                        {resultadoRegistrado.cumpleEspecificacion === false ? '✗ OOS' : '✓ Cumple'}
                                      </span>
                                      {resultadoRegistrado.observaciones && resultadoRegistrado.observaciones.includes('Registrado el') && (
                                        <span className="text-text-muted text-xs">
                                          {resultadoRegistrado.observaciones.replace('Registrado el ', '')}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {isAnalista && selectedPrueba.estado === 'EN_PROCESO' && (
                                        <>
                                          <button
                                            onClick={() => handleAgregarResultadoChecklist(prueba.parametro, prueba.especificacion, 'si')}
                                            className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors flex items-center gap-1"
                                          >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Sí
                                          </button>
                                          <button
                                            onClick={() => handleAgregarResultadoChecklist(prueba.parametro, prueba.especificacion, 'no')}
                                            className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors flex items-center gap-1"
                                          >
                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                            No
                                          </button>
                                        </>
                                      )}
                                      {(!isAnalista || selectedPrueba.estado !== 'EN_PROCESO') && (
                                        <span className="px-2 py-1 rounded text-xs bg-warning/20 text-warning font-medium">
                                          Pendiente
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Mostrar resultado si está registrado */}
                                {resultadoRegistrado && (
                                  <div className="mt-3 pt-3 border-t border-border-dark">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        {resultadoRegistrado.tipoResultado === 'checklist' ? (
                                          <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-2xl ${
                                              resultadoRegistrado.cumpleEspecificacion ? 'text-success' : 'text-danger'
                                            }`}>
                                              {resultadoRegistrado.cumpleEspecificacion ? 'check_circle' : 'cancel'}
                                            </span>
                                            <div>
                                              <p className="text-text-light font-semibold text-sm">
                                                Resultado: <span className="text-primary">{resultadoRegistrado.resultado}</span>
                                              </p>
                                              {resultadoRegistrado.observaciones && resultadoRegistrado.observaciones.includes('Registrado el') && (
                                                <p className="text-text-muted text-xs mt-0.5">
                                                  {resultadoRegistrado.observaciones}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <p className="text-text-light font-semibold text-sm">
                                              Resultado: <span className="text-primary">{resultadoRegistrado.resultado}</span> {resultadoRegistrado.unidad || ''}
                                            </p>
                                            {resultadoRegistrado.observaciones && (
                                              <p className="text-text-muted text-xs mt-2 italic">
                                                {resultadoRegistrado.observaciones}
                                              </p>
                                            )}
                                          </>
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

