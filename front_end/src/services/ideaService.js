import api from '../config/api.js';

class IdeaService {
  async getIdeas(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.prioridad) params.append('prioridad', filters.prioridad);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/ideas?${params.toString()}`);
      return response.data.data.ideas || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getIdeaById(id) {
    try {
      const response = await api.get(`/ideas/${id}`);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createIdea(ideaData) {
    try {
      const response = await api.post('/ideas', ideaData);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateIdea(id, ideaData) {
    try {
      const response = await api.put(`/ideas/${id}`, ideaData);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteIdea(id) {
    try {
      await api.delete(`/ideas/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveIdea(id) {
    try {
      const response = await api.post(`/ideas/${id}/approve`);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectIdea(id) {
    try {
      const response = await api.post(`/ideas/${id}/reject`);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAnalistas() {
    try {
      const response = await api.get('/ideas/analistas');
      return response.data.data.analistas || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupervisoresCalidad() {
    try {
      const response = await api.get('/ideas/supervisores-calidad');
      return response.data.data.supervisores || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmarProduccion(id, supervisorCalidadId, cantidad) {
    try {
      const response = await api.post(`/ideas/${id}/confirmar-produccion?supervisorCalidadId=${supervisorCalidadId}&cantidad=${cantidad}`);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMisIdeas() {
    try {
      const response = await api.get('/ideas/mis-ideas');
      return response.data.data.ideas || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrdenesProduccion() {
    try {
      const response = await api.get('/ideas/ordenes-produccion');
      return response.data.data.ordenes || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changeEstado(id, nuevoEstado, analistaId = null) {
    try {
      let url = `/ideas/${id}/change-estado?nuevoEstado=${nuevoEstado}`;
      if (analistaId) {
        url += `&analistaId=${analistaId}`;
      }
      const response = await api.post(url);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateFromProduct(productoId, objetivo) {
    try {
      const response = await api.post(`/ideas/generate-from-product?productoId=${productoId}&objetivo=${encodeURIComponent(objetivo)}`);
      return response.data.data.idea;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateFromMaterials(objetivo, materialIds, compoundIds = []) {
    try {
      const response = await api.post('/ideas/generate-from-materials', {
        objetivo,
        materialIds,
        compoundIds
      });
      return response.data.data.idea;
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

export default new IdeaService();

