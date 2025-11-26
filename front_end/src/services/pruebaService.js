import api from '../config/api.js';

class PruebaService {
  async getPruebasByIdeaId(ideaId) {
    try {
      const response = await api.get(`/pruebas/idea/${ideaId}`);
      return response.data.data.pruebas || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMisPruebas() {
    try {
      const response = await api.get('/pruebas/mis-pruebas');
      return response.data.data.pruebas || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPruebaById(id) {
    try {
      const response = await api.get(`/pruebas/${id}`);
      return response.data.data.prueba;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPrueba(pruebaData) {
    try {
      const response = await api.post('/pruebas', pruebaData);
      return response.data.data.prueba;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePrueba(id, pruebaData) {
    try {
      const response = await api.put(`/pruebas/${id}`, pruebaData);
      return response.data.data.prueba;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addResultado(pruebaId, resultadoData) {
    try {
      const response = await api.post(`/pruebas/${pruebaId}/resultados`, resultadoData);
      return response.data.data.prueba;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePrueba(id) {
    try {
      await api.delete(`/pruebas/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.error?.message || error.response.data?.message || 'Error en la petición';
      return new Error(message);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

export default new PruebaService();

