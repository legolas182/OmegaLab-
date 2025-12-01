import api from '../config/api.js';

class MaterialService {
  async getMaterials(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/materials?${params.toString()}`);
      return response.data.data.materials;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMaterialById(id) {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data.data.material;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMaterial(materialData) {
    try {
      const response = await api.post('/materials', materialData);
      return response.data.data.material;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMaterial(id, materialData) {
    try {
      const response = await api.put(`/materials/${id}`, materialData);
      return response.data.data.material;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMaterial(id) {
    try {
      await api.delete(`/materials/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMaterialCompounds(materialId) {
    try {
      const response = await api.get(`/materials/${materialId}/compounds`);
      return response.data.data.compounds || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMaterialCompound(materialId, compoundData) {
    try {
      const response = await api.post(`/materials/${materialId}/compounds`, compoundData);
      return response.data.data.compound;
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

export default new MaterialService();

