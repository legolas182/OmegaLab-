import api from '../config/api.js';

class IdeaService {
  async getIdeas(filters = {}) {
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/ideas?${params.toString()}`);
    return response.data.data.ideas || [];
  }

  async getIdeaById(id) {
    const response = await api.get(`/ideas/${id}`);
    return response.data.data.idea;
  }

  async createIdea(ideaData) {
    const response = await api.post('/ideas', ideaData);
    return response.data.data.idea;
  }

  async updateIdea(id, ideaData) {
    const response = await api.put(`/ideas/${id}`, ideaData);
    return response.data.data.idea;
  }

  async deleteIdea(id) {
    await api.delete(`/ideas/${id}`);
    return true;
  }

  async approveIdea(id) {
    const response = await api.post(`/ideas/${id}/approve`);
    return response.data.data.idea;
  }

  async rejectIdea(id) {
    const response = await api.post(`/ideas/${id}/reject`);
    return response.data.data.idea;
  }

  async getAnalistas() {
    const response = await api.get('/ideas/analistas');
    return response.data.data.analistas || [];
  }

  async getSupervisoresCalidad() {
    const response = await api.get('/ideas/supervisores-calidad');
    return response.data.data.supervisores || [];
  }

  async confirmarProduccion(id, supervisorCalidadId, cantidad) {
    const response = await api.post(`/ideas/${id}/confirmar-produccion?supervisorCalidadId=${supervisorCalidadId}&cantidad=${cantidad}`);
    return response.data.data.idea;
  }

  async getFormulaByIdeaId(id) {
    const response = await api.get(`/ideas/${id}/formula`);
    return response.data.data.formula;
  }

  async crearFormulaDesdeIdea(id) {
    const response = await api.post(`/ideas/${id}/crear-formula`);
    return response.data.data.formula;
  }

  async getMisIdeas() {
    const response = await api.get('/ideas/mis-ideas');
    return response.data.data.ideas || [];
  }

  async getOrdenesProduccion() {
    const response = await api.get('/ideas/ordenes-produccion');
    return response.data.data.ordenes || [];
  }

  async changeEstado(id, nuevoEstado, analistaId = null) {
    let url = `/ideas/${id}/change-estado?nuevoEstado=${nuevoEstado}`;
    if (analistaId) {
      url += `&analistaId=${analistaId}`;
    }
    const response = await api.post(url);
    return response.data.data.idea;
  }

  async generateFromProduct(productoId, objetivo) {
    const response = await api.post(`/ideas/generate-from-product?productoId=${productoId}&objetivo=${encodeURIComponent(objetivo)}`);
    return response.data.data.idea;
  }

  async generateFromMaterials(objetivo, materialIds, compoundIds = []) {
    const response = await api.post('/ideas/generate-from-materials', {
      objetivo,
      materialIds,
      compoundIds
    });
    return response.data.data.idea;
  }
}

export default new IdeaService();
