import api from '../config/api'

const chemicalDatabaseService = {
  async searchPubChem(query, type = 'NAME') {
    const response = await api.get('/chemical/search/pubchem', {
      params: { query, type }
    })
    return response.data.data.compounds || []
  },

  async searchChEMBL(query, type = 'NAME') {
    const response = await api.get('/chemical/search/chembl', {
      params: { query, type }
    })
    return response.data.data.compounds || []
  },

  async searchAll(query, type = 'NAME') {
    const response = await api.get('/chemical/search/all', {
      params: { query, type }
    })
    return response.data.data.results || {}
  },

  async getCompoundDetails(source, sourceId) {
    const response = await api.get(`/chemical/details/${source}/${sourceId}`)
    return response.data.data.compound
  },

  async saveToCache(compound) {
    const response = await api.post('/chemical/cache', compound)
    return response.data.data.compound
  }
}

export default chemicalDatabaseService
