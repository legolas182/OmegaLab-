import api from '../config/api.js';

class CategoryService {
  async getCategories(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipoProducto', filters.tipo);
      if (filters.tipoProducto) params.append('tipoProducto', filters.tipoProducto);
      if (filters.search) params.append('search', filters.search);
      if (filters.all) params.append('all', 'true');

      const response = await api.get(`/categories?${params.toString()}`);
      // CategoryController devuelve directamente { categories: [...] } sin envolver en "data"
      return response.data.categories || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
      return response.data.category;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
      return response.data.category;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
      return response.data.category;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
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

export default new CategoryService();

