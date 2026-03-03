import api from '../config/api.js';

class ProduccionService {
  async getOrdenesProduccion() {
    const response = await api.get('/produccion/ordenes');
    return response.data.data.ordenes || [];
  }

  async getOrdenById(id) {
    const response = await api.get(`/produccion/ordenes/${id}`);
    return response.data.data.orden;
  }

  async getOrdenDetalle(id) {
    const response = await api.get(`/produccion/ordenes/${id}/detalle`);
    return response.data.data.detalle;
  }

  async generarLote(ordenId) {
    const response = await api.post(`/produccion/ordenes/${ordenId}/generar-lote`);
    return response.data.data.lote;
  }
}

export default new ProduccionService();
