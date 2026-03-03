import api from '../config/api.js';

class MaterialService {
  async getMaterials(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/materials?${params.toString()}`);
    return response.data.data.materials;
  }

  async getMaterialById(id) {
    const response = await api.get(`/materials/${id}`);
    return response.data.data.material;
  }

  async createMaterial(materialData) {
    const response = await api.post('/materials', materialData);
    return response.data.data.material;
  }

  async updateMaterial(id, materialData) {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data.data.material;
  }

  async deleteMaterial(id) {
    await api.delete(`/materials/${id}`);
    return true;
  }

  async getMaterialCompounds(materialId) {
    const response = await api.get(`/materials/${materialId}/compounds`);
    return response.data.data.compounds || [];
  }

  async createMaterialCompound(materialId, compoundData) {
    const response = await api.post(`/materials/${materialId}/compounds`, compoundData);
    return response.data.data.compound;
  }
}

export default new MaterialService();
