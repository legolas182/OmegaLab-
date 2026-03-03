import api from '../config/api.js';

class LoteService {
  async getAllLotes() {
    const response = await api.get('/lotes');
    return response.data.data.lotes || [];
  }

  async getLoteByCodigo(codigo) {
    const response = await api.get(`/lotes/${codigo}`);
    return response.data.data.lote;
  }
}

export default new LoteService();
