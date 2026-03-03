import api from '../config/api'

const formulaService = {
  async createFormulaFromMaterials(formulaData) {
    const response = await api.post('/formulas/create-from-materials', formulaData)
    return response.data.data.formula
  },

  async createVariant(formulaId, variantData) {
    const response = await api.post(`/formulas/${formulaId}/create-variant`, variantData)
    return response.data.data.formula
  },

  async getFormulas(estado = null, search = null) {
    const params = {}
    if (estado) params.estado = estado
    if (search) params.search = search

    const response = await api.get('/formulas', { params })
    return response.data.data.formulas || []
  },

  async getFormulaById(id) {
    const response = await api.get(`/formulas/${id}`)
    return response.data.data.formula
  },

  async getFormulaVersions(id) {
    const response = await api.get(`/formulas/${id}/versions`)
    return response.data.data.versions || []
  },

  async updateFormula(id, formulaData) {
    const response = await api.put(`/formulas/${id}`, formulaData)
    return response.data.data.formula
  },

  async changeEstado(id, nuevoEstado) {
    const response = await api.post(`/formulas/${id}/change-estado`, null, {
      params: { nuevoEstado }
    })
    return response.data.data.formula
  },

  async validateFormula(id) {
    const response = await api.post(`/formulas/${id}/validate`)
    return response.data.data
  },

  async deleteFormula(id) {
    const response = await api.delete(`/formulas/${id}`)
    return response.data
  }
}

export default formulaService
