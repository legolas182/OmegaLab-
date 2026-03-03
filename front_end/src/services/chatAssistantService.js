import api from '../config/api.js';

/**
 * Servicio para el asistente de chat IA
 */
class ChatAssistantService {
    /**
     * Envía un mensaje al asistente de IA
     * @param {string} message - Mensaje del usuario
     * @returns {Promise<Object>} Respuesta de la IA
     */
    async sendMessage(message) {
        const response = await api.post('/chat/assistant', { message });
        return response.data.data;
    }

    /**
     * Obtiene el stock de un producto específico
     * @param {string} productName - Nombre del producto
     * @returns {Promise<Object>} Información del stock
     */
    async getProductStock(productName) {
        const response = await api.get('/chat/product-stock', {
            params: { name: productName }
        });
        return response.data.data;
    }

    /**
     * Obtiene el stock de una materia prima específica
     * @param {string} materialName - Nombre de la materia prima
     * @returns {Promise<Object>} Información del stock
     */
    async getMaterialStock(materialName) {
        const response = await api.get('/chat/material-stock', {
            params: { name: materialName }
        });
        return response.data.data;
    }
}

export default new ChatAssistantService();
