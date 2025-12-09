import api from '../config/api.js';

class ProduccionService {
  async getOrdenesProduccion() {
    try {
      const response = await api.get('/produccion/ordenes');
      return response.data.data.ordenes || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrdenById(id) {
    try {
      const response = await api.get(`/produccion/ordenes/${id}`);
      return response.data.data.orden;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDispensacionByOrdenId(ordenId) {
    try {
      const response = await api.get(`/produccion/ordenes/${ordenId}/dispensacion`);
      return response.data.data.dispensacion;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async saveDispensacion(ordenId, dispensacionData) {
    try {
      const response = await api.post(`/produccion/ordenes/${ordenId}/dispensacion`, dispensacionData);
      return response.data.data.dispensacion;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLineClearanceByOrdenId(ordenId) {
    try {
      const response = await api.get(`/produccion/ordenes/${ordenId}/line-clearance`);
      return response.data.data.lineClearance;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async saveLineClearance(ordenId, lineClearanceData) {
    try {
      const response = await api.post(`/produccion/ordenes/${ordenId}/line-clearance`, lineClearanceData);
      return response.data.data.lineClearance;
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

export default new ProduccionService();

