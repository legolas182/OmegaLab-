import toast from "react-hot-toast";

/**
 * Servicio centralizado para notificaciones con react-hot-toast
 */

/**
 * Extrae el mensaje de error del backend de una respuesta de Axios
 * @param {Error} error - Objeto de error de Axios
 * @returns {string} Mensaje formateado
 */
export const extractMessage = (error) => {
    if (!error) return "Error inesperado";

    // Si es una respuesta del servidor
    if (error.response) {
        const data = error.response.data;
        const message = data?.error?.message || (typeof data?.error === 'string' ? data.error : null) || data?.message || "Error en la petición";
        return message;
    }

    // Si la petición se hizo pero no hubo respuesta
    if (error.request) {
        return "No se pudo conectar con el servidor";
    }

    // Otros errores
    return error.message || "Error inesperado";
};

/**
 * Verifica si es un error de validación (400 con detalles)
 * @param {Error} error - Objeto de error de Axios
 * @returns {boolean}
 */
export const isValidationError = (error) => {
    return (
        error.response?.status === 400 &&
        error.response?.data?.details
    );
};

/**
 * Muestra una notificación de error
 * @param {Error|string} error - Objeto de error o mensaje directo
 */
export const notifyError = (error) => {
    const message = typeof error === 'string' ? error : extractMessage(error);
    toast.error(message);
};

/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje a mostrar
 */
export const notifySuccess = (message) => {
    toast.success(message);
};

const toastService = {
    extractMessage,
    isValidationError,
    notifyError,
    notifySuccess
};

export default toastService;
