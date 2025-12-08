import api from '../config/api'

const chemicalDatabaseService = {
  async searchPubChem(query, type = 'NAME') {
    try {
      const response = await api.get('/chemical/search/pubchem', {
        params: { query, type }
      })
      return response.data.data.compounds || []
    } catch (error) {
      console.error('Error buscando en PubChem:', error)
      throw error
    }
  },

  async searchChEMBL(query, type = 'NAME') {
    try {
      const response = await api.get('/chemical/search/chembl', {
        params: { query, type }
      })
      return response.data.data.compounds || []
    } catch (error) {
      console.error('Error buscando en ChEMBL:', error)
      throw error
    }
  },

  async searchAll(query, type = 'NAME') {
    try {
      const response = await api.get('/chemical/search/all', {
        params: { query, type }
      })
      return response.data.data.results || {}
    } catch (error) {
      console.error('Error buscando en todas las bases:', error)
      throw error
    }
  },

  async getCompoundDetails(source, sourceId) {
    try {
      const response = await api.get(`/chemical/details/${source}/${sourceId}`)
      return response.data.data.compound
    } catch (error) {
      console.error('Error obteniendo detalles del compuesto:', error)
      throw error
    }
  },

  async saveToCache(compound) {
    try {
      const response = await api.post('/chemical/cache', compound)
      return response.data.data.compound
    } catch (error) {
      console.error('Error guardando en cache:', error)
      throw error
    }
  }
}

export default chemicalDatabaseService

