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
        try {
            const response = await api.post('/chat/assistant', { message });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Obtiene el stock de un producto específico
     * @param {string} productName - Nombre del producto
     * @returns {Promise<Object>} Información del stock
     */
    async getProductStock(productName) {
        try {
            const response = await api.get('/chat/product-stock', {
                params: { name: productName }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Obtiene el stock de una materia prima específica
     * @param {string} materialName - Nombre de la materia prima
     * @returns {Promise<Object>} Información del stock
     */
    async getMaterialStock(materialName) {
        try {
            const response = await api.get('/chat/material-stock', {
                params: { name: materialName }
            });
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Maneja errores de la API
     * @param {Error} error - Error de axios
     * @returns {Error}
     */
    handleError(error) {
        if (error.response) {
            const message = error.response.data?.error || error.response.data?.message || 'Error en la petición';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
            return new Error(error.message || 'Error desconocido');
        }
    }
}

export default new ChatAssistantService();
