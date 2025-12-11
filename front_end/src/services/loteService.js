import api from '../config/api.js';

class LoteService {
  async getAllLotes() {
    try {
      const response = await api.get('/lotes');
      return response.data.data.lotes || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLoteByCodigo(codigo) {
    try {
      const response = await api.get(`/lotes/${codigo}`);
      return response.data.data.lote;
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

export default new LoteService();

