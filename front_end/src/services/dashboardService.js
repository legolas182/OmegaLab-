import api from '../config/api.js'
import ideaService from './ideaService'
import pruebaService from './pruebaService'
import productService from './productService'
import materialService from './materialService'
import formulaService from './formulaService'
/**
 * Servicio para obtener datos agregados del Dashboard
 */
class DashboardService {
  async getDashboardData(userRole) {
    const data = {
      ideas: { total: 0, porEstado: {}, list: [] },
      pruebas: { total: 0, porEstado: {}, list: [] },
      productos: { total: 0 },
      materiales: { total: 0 },
      formulas: { total: 0, porEstado: {} },
      ordenes: { total: 0, enProceso: 0, completadas: 0, list: [] }
    }

    try {
      const isAnalista = userRole === 'ANALISTA_LABORATORIO'

      const [
        ideasRes,
        pruebasRes,
        productosRes,
        materialesRes,
        formulasRes,
        ordenesRes
      ] = await Promise.allSettled([
        isAnalista ? ideaService.getMisIdeas() : ideaService.getIdeas(),
        pruebaService.getMisPruebas(),
        productService.getProducts(),
        materialService.getMaterials(),
        formulaService.getFormulas(),
        ideaService.getOrdenesProduccion()
      ])

      if (ideasRes.status === 'fulfilled' && ideasRes.value) {
        const ideas = Array.isArray(ideasRes.value) ? ideasRes.value : []
        data.ideas.total = ideas.length
        data.ideas.list = ideas.slice(0, 5)
        ideas.forEach(i => {
          const estado = i.estado || 'sin_estado'
          data.ideas.porEstado[estado] = (data.ideas.porEstado[estado] || 0) + 1
        })
      }

      if (pruebasRes.status === 'fulfilled' && pruebasRes.value) {
        const pruebas = Array.isArray(pruebasRes.value) ? pruebasRes.value : []
        data.pruebas.total = pruebas.length
        data.pruebas.list = pruebas.slice(0, 5)
        pruebas.forEach(p => {
          const estado = p.estado || 'sin_estado'
          data.pruebas.porEstado[estado] = (data.pruebas.porEstado[estado] || 0) + 1
        })
      }

      if (productosRes.status === 'fulfilled' && productosRes.value) {
        data.productos.total = Array.isArray(productosRes.value) ? productosRes.value.length : 0
      }

      if (materialesRes.status === 'fulfilled' && materialesRes.value) {
        data.materiales.total = Array.isArray(materialesRes.value) ? materialesRes.value.length : 0
      }

      if (formulasRes.status === 'fulfilled' && formulasRes.value) {
        const formulas = Array.isArray(formulasRes.value) ? formulasRes.value : []
        data.formulas.total = formulas.length
        formulas.forEach(f => {
          const estado = f.estado || 'sin_estado'
          data.formulas.porEstado[estado] = (data.formulas.porEstado[estado] || 0) + 1
        })
      }

      if (ordenesRes.status === 'fulfilled' && ordenesRes.value) {
        const ordenes = Array.isArray(ordenesRes.value) ? ordenesRes.value : []
        data.ordenes.total = ordenes.length
        data.ordenes.list = ordenes.slice(0, 5)
        ordenes.forEach(o => {
          const estado = (o.estado || '').toUpperCase()
          if (estado === 'EN_PROCESO' || estado === 'PENDIENTE') data.ordenes.enProceso++
          else if (estado === 'COMPLETADA') data.ordenes.completadas++
        })
      }

      return data
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
      return data
    }
  }
}

export default new DashboardService()
