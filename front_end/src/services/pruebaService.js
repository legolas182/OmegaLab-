import api from '../config/api.js';

class PruebaService {
  async getPruebasByIdeaId(ideaId) {
    const response = await api.get(`/pruebas/idea/${ideaId}`);
    return response.data.data.pruebas || [];
  }

  async getMisPruebas() {
    const response = await api.get('/pruebas/mis-pruebas');
    return response.data.data.pruebas || [];
  }

  async getPruebaById(id) {
    const response = await api.get(`/pruebas/${id}`);
    return response.data.data.prueba;
  }

  async createPrueba(pruebaData) {
    const response = await api.post('/pruebas', pruebaData);
    return response.data.data.prueba;
  }

  async updatePrueba(id, pruebaData) {
    const response = await api.put(`/pruebas/${id}`, pruebaData);
    return response.data.data.prueba;
  }

  async addResultado(pruebaId, resultadoData) {
    const response = await api.post(`/pruebas/${pruebaId}/resultados`, resultadoData);
    return response.data.data.prueba;
  }

  async deletePrueba(id) {
    await api.delete(`/pruebas/${id}`);
    return true;
  }
}

export default new PruebaService();
