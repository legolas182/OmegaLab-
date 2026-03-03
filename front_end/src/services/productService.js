import api from '../config/api.js';

/**
 * Servicio de productos y BOM
 * Maneja todas las llamadas al backend relacionadas con productos y lista de materiales
 */
class ProductService {
  /**
   * Obtiene todos los productos
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data.products;
  }

  /**
   * Obtiene un producto por ID con su BOM
   * @param {number} id - ID del producto
   * @returns {Promise<Object>}
   */
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  }

  /**
   * Crea un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>}
   */
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data.data.product;
  }

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data.product;
  }

  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>}
   */
  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
    return true;
  }

  /**
   * Crea o actualiza el BOM de un producto
   * @param {number} productoId - ID del producto
   * @param {Object} bomData - Datos del BOM
   * @returns {Promise<Object>}
   */
  async createOrUpdateBOM(productoId, bomData) {
    const response = await api.post(`/products/${productoId}/bom`, bomData);
    return response.data.data.bom;
  }

  /**
   * Agrega un material al BOM
   * @param {number} bomId - ID del BOM
   * @param {Object} itemData - Datos del material
   * @returns {Promise<Object>}
   */
  async addMaterialToBOM(bomId, itemData) {
    const response = await api.post(`/products/boms/${bomId}/items`, itemData);
    return response.data.data.item;
  }

  /**
   * Obtiene el BOM completo con sus items
   * @param {number} bomId - ID del BOM
   * @returns {Promise<Object>}
   */
  async getBOMWithItems(bomId) {
    const response = await api.get(`/products/boms/${bomId}`);
    return response.data.data.bom;
  }

  /**
   * Actualiza un item del BOM
   * @param {number} itemId - ID del item
   * @param {Object} itemData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async updateBOMItem(itemId, itemData) {
    const response = await api.put(`/products/bom-items/${itemId}`, itemData);
    return response.data.data.item;
  }

  /**
   * Elimina un item del BOM
   * @param {number} itemId - ID del item
   * @returns {Promise<boolean>}
   */
  async deleteBOMItem(itemId) {
    await api.delete(`/products/bom-items/${itemId}`);
    return true;
  }

  /**
   * Obtiene el historial de versiones del BOM
   * @param {number} productoId - ID del producto
   * @returns {Promise<Array>}
   */
  async getBOMHistory(productoId) {
    const response = await api.get(`/products/${productoId}/bom/history`);
    return response.data.data.history;
  }

  /**
   * Valida los porcentajes de un BOM usando procedimiento almacenado
   * @param {number} bomId - ID del BOM
   * @returns {Promise<Object>} - { valido, sumaTotal, mensaje }
   */
  async validateBOM(bomId) {
    const response = await api.get(`/products/boms/${bomId}/validar`);
    return response.data.data;
  }

  /**
   * Calcula los totales de un BOM usando procedimiento almacenado
   * @param {number} bomId - ID del BOM
   * @returns {Promise<Object>} - { totalPorcentaje, totalCantidad, numItems, detalle }
   */
  async calculateBOMTotals(bomId) {
    const response = await api.get(`/products/boms/${bomId}/totales`);
    return response.data.data;
  }

  /**
   * Verifica si hay stock suficiente para producir un producto usando procedimiento almacenado
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Cantidad a producir
   * @returns {Promise<Object>} - { disponible, mensaje }
   */
  async verifyStockProduction(productoId, cantidad) {
    const response = await api.get(`/products/${productoId}/verificar-stock`, {
      params: { cantidad }
    });
    return response.data.data;
  }
}

export default new ProductService();
