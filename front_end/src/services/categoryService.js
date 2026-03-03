import api from '../config/api.js';

class CategoryService {
  async getCategories(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipoProducto', filters.tipo);
    if (filters.tipoProducto) params.append('tipoProducto', filters.tipoProducto);
    if (filters.search) params.append('search', filters.search);
    if (filters.all) params.append('all', 'true');

    const response = await api.get(`/categories?${params.toString()}`);
    // CategoryController devuelve directamente { categories: [...] } sin envolver en "data"
    return response.data.categories || [];
  }

  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
    return response.data.category;
  }

  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
    return response.data.category;
  }

  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    // CategoryController devuelve directamente { category: {...} } sin envolver en "data"
    return response.data.category;
  }

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
    return true;
  }
}

export default new CategoryService();
