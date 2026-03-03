import axios from 'axios';
import { notifyError, isValidationError, extractMessage } from '../utils/toastService';

/**
 * Configuración de Axios para comunicación con el backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor para agregar token JWT a todas las requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar errores de respuesta
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Manejo de error 401 (ya existente)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // 2. Normalizar el mensaje de error (replicando la lógica de handleError de los servicios)
    // Esto asegura que err.message en los componentes contenga el mensaje del backend
    const normalizedMessage = extractMessage(error);
    error.message = normalizedMessage;

    // 3. Notificación visual automática
    // No notificamos si es error de validación (400 con details) porque se maneja inline
    // ni tampoco 401 porque ya redirigimos
    if (!isValidationError(error) && error.response?.status !== 401) {
      notifyError(error);
    }

    return Promise.reject(error);
  }
);

export default api;

