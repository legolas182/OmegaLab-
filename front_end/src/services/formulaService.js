import api from '../config/api'

const formulaService = {
  async createFormulaFromMaterials(formulaData) {
    try {
      const response = await api.post('/formulas/create-from-materials', formulaData)
      return response.data.data.formula
    } catch (error) {
      console.error('Error creando fórmula:', error)
      throw error
    }
  },

  async createVariant(formulaId, variantData) {
    try {
      const response = await api.post(`/formulas/${formulaId}/create-variant`, variantData)
      return response.data.data.formula
    } catch (error) {
      console.error('Error creando variante:', error)
      throw error
    }
  },

  async getFormulas(estado = null, search = null) {
    try {
      const params = {}
      if (estado) params.estado = estado
      if (search) params.search = search
      
      const response = await api.get('/formulas', { params })
      return response.data.data.formulas || []
    } catch (error) {
      console.error('Error obteniendo fórmulas:', error)
      throw error
    }
  },

  async getFormulaById(id) {
    try {
      const response = await api.get(`/formulas/${id}`)
      return response.data.data.formula
    } catch (error) {
      console.error('Error obteniendo fórmula:', error)
      throw error
    }
  },

  async getFormulaVersions(id) {
    try {
      const response = await api.get(`/formulas/${id}/versions`)
      return response.data.data.versions || []
    } catch (error) {
      console.error('Error obteniendo versiones:', error)
      throw error
    }
  },

  async updateFormula(id, formulaData) {
    try {
      const response = await api.put(`/formulas/${id}`, formulaData)
      return response.data.data.formula
    } catch (error) {
      console.error('Error actualizando fórmula:', error)
      throw error
    }
  },

  async changeEstado(id, nuevoEstado) {
    try {
      const response = await api.post(`/formulas/${id}/change-estado`, null, {
        params: { nuevoEstado }
      })
      return response.data.data.formula
    } catch (error) {
      console.error('Error cambiando estado:', error)
      throw error
    }
  },

  async validateFormula(id) {
    try {
      const response = await api.post(`/formulas/${id}/validate`)
      return response.data.data
    } catch (error) {
      console.error('Error validando fórmula:', error)
      throw error
    }
  },

  async deleteFormula(id) {
    try {
      const response = await api.delete(`/formulas/${id}`)
      return response.data
    } catch (error) {
      console.error('Error eliminando fórmula:', error)
      throw error
    }
  }
}

export default formulaService

