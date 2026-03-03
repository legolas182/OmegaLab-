import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
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
  const [searchTerm, setSearchTerm] = useState('')

  const pruebasFiltered = (pruebas || []).filter((p) =>
    (p.codigoMuestra || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tipoPrueba || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      toast.error('Por favor completa todos los campos requeridos')
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
        estado: 'pendiente'
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
      if (todosCumplen && (pruebaCompleta.estado || '').toLowerCase() === 'en_proceso') {
        await pruebaService.updatePrueba(pruebaCompleta.id, { estado: 'completada' })
        const pruebaActualizadaEstado = await pruebaService.getPruebaById(pruebaCompleta.id)
        setSelectedPrueba(pruebaActualizadaEstado)
        loadPruebas()
        if (isAnalista) {
          loadIdeasAsignadas()
        }
      } else if (hayOOS && (pruebaCompleta.estado || '').toLowerCase() === 'en_proceso') {
        await pruebaService.updatePrueba(pruebaCompleta.id, { estado: 'oos' })
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
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-text-light text-2xl font-bold">Pruebas / Control de Calidad (LIMS)</h1>
          <p className="text-text-muted text-sm mt-1">
            {isAnalista
              ? 'Pruebas de laboratorio vinculadas a ideas asignadas'
              : 'Trazabilidad completa de muestras y resultados analíticos'}
          </p>
        </div>
        {isAnalista && ideasAsignadas.length > 0 && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            Nueva Prueba
          </button>
        )}
      </div>

      {/* ALERTAS OOS */}
      {pruebas.filter(p => (p.estado || '').toLowerCase() === 'oos').length > 0 && (
        <div className="mb-6 rounded-lg bg-danger/20 border border-danger/50 p-4 flex items-center gap-3 shrink-0 animate-pulse-subtle">
          <span className="material-symbols-outlined text-danger text-2xl">error</span>
          <div className="flex-1">
            <p className="text-text-light font-semibold">
              {pruebas.filter(p => (p.estado || '').toLowerCase() === 'oos').length} Resultado{pruebas.filter(p => (p.estado || '').toLowerCase() === 'oos').length === 1 ? '' : 's'} Fuera de Especificación (OOS)
            </p>
            <p className="text-text-muted text-sm">Requieren investigación y documentación inmediata</p>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL FLEX (LISTA + DETALLE) */}
      <div className="flex flex-1 min-h-0 gap-6 overflow-hidden">

        {/* PANEL IZQUIERDO: LISTA DE PRUEBAS */}
        <div className={`transition-all duration-500 ease-in-out ${selectedPrueba ? 'w-1/3' : 'w-full'} flex flex-col min-h-0`}>
          <div className="rounded-xl bg-card-dark border border-border-dark flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-border-dark shrink-0 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-text-light font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">biotech</span>
                  {isAnalista ? 'Mis Pruebas' : 'Pruebas Globales'}
                </h2>
                <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {pruebasFiltered.length}
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm scale-75">search</span>
                <input
                  type="text"
                  placeholder="ID Muestra, tipo, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-sm text-text-light focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
              {loadingPruebas ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-text-muted text-sm">Sincronizando con base de datos...</p>
                </div>
              ) : pruebasFiltered.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-text-muted/30 mb-4">search_off</span>
                  <p className="text-text-muted text-sm font-medium">
                    No se encontraron resultados
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-card-dark z-10">
                      <tr className="border-b border-border-dark shadow-sm">
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase">Muestra</th>
                        {!selectedPrueba && <th className="p-4 text-text-muted text-xs font-semibold uppercase">Referencia</th>}
                        {!selectedPrueba && <th className="p-4 text-text-muted text-xs font-semibold uppercase">Ensayo</th>}
                        <th className="p-4 text-text-muted text-xs font-semibold uppercase text-center">Estado</th>
                        <th className="p-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/30">
                      {pruebasFiltered.map((prueba) => (
                        <tr
                          key={prueba.id}
                          onClick={() => handleVerDetalle(prueba)}
                          className={`group cursor-pointer transition-colors ${selectedPrueba?.id === prueba.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5'}`}
                        >
                          <td className="p-4">
                            <p className="text-text-light font-semibold text-sm leading-none">{prueba.codigoMuestra}</p>
                            {selectedPrueba && <p className="text-xs text-text-muted mt-1 truncate max-w-[150px]">{prueba.tipoPrueba}</p>}
                          </td>
                          {!selectedPrueba && (
                            <td className="p-4">
                              <p className="text-text-muted text-xs">Idea #{prueba.ideaId}</p>
                            </td>
                          )}
                          {!selectedPrueba && (
                            <td className="p-4">
                              <p className="text-text-light text-xs font-semibold">{prueba.tipoPrueba}</p>
                            </td>
                          )}
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${getEstadoColor(prueba.estado)}`}>
                              {getEstadoLabel(prueba.estado)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="w-8 h-8 rounded-lg bg-primary/0 group-hover:bg-primary/20 text-primary transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: DETALLE DE PRUEBA */}
        {selectedPrueba && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 rounded-2xl border border-cyan-500/30 animate-scale-in shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* GRADIENTE DE FONDO SUTIL */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* HEADER FIJO DEL PANEL DERECHO */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between shrink-0 relative z-10">
              <div className="flex flex-col">
                <h2 className="text-text-light text-xl font-bold">
                  {selectedPrueba.codigoMuestra}
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  {selectedPrueba.tipoPrueba}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrueba(null)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-danger/20 text-text-muted hover:text-danger group shrink-0"
              >
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>

            {/* CONTENIDO CON SCROLL INTERNO INDEPENDIENTE */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 custom-scroll p-6 relative z-10">

              {/* BLOQUE DE ACCIONES RÁPIDAS */}
              {isAnalista && (
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 shadow-inner">
                  <h3 className="text-text-light text-xs font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Control de Fase Analítica
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {(selectedPrueba.estado || '').toLowerCase() === 'pendiente' && (
                      <button
                        onClick={() => handleChangeEstado('en_proceso')}
                        disabled={updatingEstado}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-3 shadow-[0_4px_15px_rgba(var(--color-primary),0.3)]"
                      >
                        <span className="material-symbols-outlined text-lg">play_circle</span>
                        Iniciar Protocolo
                      </button>
                    )}
                    {(selectedPrueba.estado || '').toLowerCase() === 'en_proceso' && (
                      <>
                        <button
                          onClick={() => handleChangeEstado('oos')}
                          disabled={updatingEstado}
                          className="px-5 py-2.5 rounded-lg bg-warning/20 text-warning border border-warning/30 text-sm font-medium transition-all hover:bg-warning hover:text-white flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">report_problem</span>
                          Notificar OOS
                        </button>
                        <button
                          onClick={() => handleChangeEstado('rechazada')}
                          disabled={updatingEstado}
                          className="px-5 py-2.5 rounded-lg bg-danger/20 text-danger border border-danger/30 text-sm font-medium transition-all hover:bg-danger hover:text-white flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">block</span>
                          Invalidar Ciclo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* INFO ANALÍTICA */}
                <div>
                  <h3 className="text-text-light text-xs font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Metadatos de Seguimiento
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                      <p className="text-xs text-text-muted font-semibold uppercase mb-1.5 tracking-tight">Status Actual</p>
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-semibold uppercase border border-current/20 ${getEstadoColor(selectedPrueba.estado)}`}>
                        {getEstadoLabel(selectedPrueba.estado)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                      <p className="text-xs text-text-muted font-semibold uppercase mb-1.5 tracking-tight">Proyecto Relacionado</p>
                      <p className="text-text-light text-sm font-semibold tracking-tight">Idea #{selectedPrueba.ideaId}</p>
                    </div>
                  </div>
                </div>

                {/* LOGÍSTICA */}
                <div>
                  <h3 className="text-text-light text-xs font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Logística y Equipos
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                      <p className="text-xs text-text-muted font-semibold uppercase mb-1.5 tracking-tight">Fecha Apertura</p>
                      <p className="text-text-light text-sm font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                        {selectedPrueba.fechaMuestreo ? new Date(selectedPrueba.fechaMuestreo).toLocaleString('es-ES') : 'N/A'}
                      </p>
                    </div>
                    {selectedPrueba.equiposUtilizados && (
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                        <p className="text-xs text-text-muted font-semibold uppercase mb-1.5 tracking-tight">Asset Management</p>
                        <p className="text-text-light text-sm font-semibold flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary">precision_manufacturing</span>
                          {selectedPrueba.equiposUtilizados}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTEXTO / NOTAS */}
              {selectedPrueba.descripcion && (
                <div className="mb-8">
                  <h3 className="text-text-light text-xs font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Descripción de Procedimiento
                  </h3>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-text-muted text-sm italic leading-relaxed">
                    "{selectedPrueba.descripcion}"
                  </div>
                </div>
              )}

              {/* RESULTADOS OPERATIVOS */}
              {selectedPrueba.pruebasRequeridas && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-5 leading-none">
                    <h3 className="text-text-light text-xs font-semibold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      Resultados y Especificaciones
                    </h3>
                    <span className="text-xs font-medium text-text-muted bg-white/5 px-2 py-1 rounded">
                      {parsePruebasRequeridas(selectedPrueba.pruebasRequeridas).length} Parámetros
                    </span>
                  </div>

                  <div className="space-y-4">
                    {parsePruebasRequeridas(selectedPrueba.pruebasRequeridas).map((prueba, index) => {
                      const resultadoRegistrado = selectedPrueba.resultados?.find(r =>
                        r.parametro.toLowerCase().includes(prueba.parametro.toLowerCase()) ||
                        prueba.parametro.toLowerCase().includes(r.parametro.toLowerCase())
                      )

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-2xl border transition-all duration-300 ${resultadoRegistrado
                            ? resultadoRegistrado.cumpleEspecificacion === false
                              ? 'bg-danger/10 border-danger/30 shadow-[0_4px_15px_rgba(239,68,68,0.1)]'
                              : 'bg-success/5 border-success/30 shadow-[0_4px_15px_rgba(34,197,94,0.05)]'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-6 leading-none">
                            <div className="flex-1">
                              <p className="text-text-light font-semibold text-sm mb-2">{prueba.parametro}</p>
                              {prueba.especificacion && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-text-muted uppercase bg-white/5 px-1.5 py-0.5 rounded">Rango Permitido</span>
                                  <p className="text-cyan-400 font-mono text-xs">{prueba.especificacion}</p>
                                </div>
                              )}
                            </div>

                            {resultadoRegistrado ? (
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase shadow-lg ${resultadoRegistrado.cumpleEspecificacion === false
                                  ? 'bg-danger text-white'
                                  : 'bg-success text-white'
                                  }`}>
                                  {resultadoRegistrado.cumpleEspecificacion === false ? 'Out of Spec' : 'Pass'}
                                </span>
                                <span className="text-text-muted text-xs font-mono opacity-60">
                                  {resultadoRegistrado.observaciones?.split('Registrado el ')[1] || 'Reciente'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 shrink-0">
                                {isAnalista && (selectedPrueba.estado || '').toLowerCase() === 'en_proceso' ? (
                                  <>
                                    <button
                                      onClick={() => handleAgregarResultadoChecklist(prueba.parametro, prueba.especificacion, 'si')}
                                      className="w-12 h-12 rounded-2xl bg-success/20 text-success hover:bg-success hover:text-white transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center border border-success/30"
                                      title="Configurar como CUMPLE"
                                    >
                                      <span className="material-symbols-outlined text-2xl">verified</span>
                                    </button>
                                    <button
                                      onClick={() => handleAgregarResultadoChecklist(prueba.parametro, prueba.especificacion, 'no')}
                                      className="w-12 h-12 rounded-2xl bg-danger/20 text-danger hover:bg-danger hover:text-white transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center border border-danger/30"
                                      title="Configurar como NO CUMPLE"
                                    >
                                      <span className="material-symbols-outlined text-2xl">error_outline</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-text-muted font-semibold uppercase border border-white/10">
                                    En Espera
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {resultadoRegistrado && (
                            <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-6 animate-fade-in">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${resultadoRegistrado.cumpleEspecificacion ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
                                }`}>
                                <span className="material-symbols-outlined text-3xl font-light">
                                  {resultadoRegistrado.cumpleEspecificacion ? 'fingerprint' : 'warning_amber'}
                                </span>
                              </div>
                              <div className="flex-1 leading-none">
                                <p className="text-text-muted text-xs font-semibold uppercase mb-1.5">Valor Capturado</p>
                                <p className="text-3xl font-bold text-white flex items-baseline gap-2">
                                  {resultadoRegistrado.resultado}
                                  <span className="text-xs font-medium text-text-muted/60 opacity-60">RAW DATA</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DIÁLOGOS MODALES */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowCreateDialog(false)}
        >
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-in overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-text-light text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Configurar Nueva Prueba
              </h3>
              <button onClick={() => setShowCreateDialog(false)} className="text-text-muted hover:text-white leading-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 custom-scroll max-h-[70vh] overflow-y-auto space-y-6">
              <div>
                <label className="block text-[10px] font-semibold text-primary uppercase mb-2">Proyecto de Origen *</label>
                <select
                  value={nuevaPrueba.ideaId}
                  onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, ideaId: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-text-light focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                >
                  <option value="" className="bg-slate-900">Vincular a Idea existente...</option>
                  {ideasAsignadas.map((idea) => (
                    <option key={idea.id} value={idea.id} className="bg-slate-900">
                      ID: {idea.id} - {idea.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-primary uppercase mb-2">Código LIMS *</label>
                  <input
                    type="text"
                    value={nuevaPrueba.codigoMuestra}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, codigoMuestra: e.target.value })}
                    placeholder="Ej: MU-1102"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-primary uppercase mb-2">Categoría *</label>
                  <input
                    type="text"
                    value={nuevaPrueba.tipoPrueba}
                    onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, tipoPrueba: e.target.value })}
                    placeholder="Materia Prima, Estabilidad..."
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-primary uppercase mb-2">Workflow de Pruebas</label>
                <textarea
                  value={nuevaPrueba.pruebasRequeridas}
                  onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, pruebasRequeridas: e.target.value })}
                  placeholder="Formato:&#10;- Parámetro (especificación: valor)&#10;- pH (especificación: 6.5 - 7.5)"
                  rows="4"
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xs font-mono resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-primary uppercase mb-2">Contexto Adicional</label>
                <textarea
                  value={nuevaPrueba.descripcion}
                  onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, descripcion: e.target.value })}
                  placeholder="Instrucciones especiales para el analista..."
                  rows="2"
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xs resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-white/5 flex gap-4 justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-6 py-2 rounded-lg text-text-muted text-sm font-medium hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePrueba}
                className="px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Registrar Prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pruebas

