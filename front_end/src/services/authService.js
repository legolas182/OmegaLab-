import api from '../config/api.js';

/**
 * Servicio de autenticación
 * Maneja todas las llamadas al backend relacionadas con autenticación
 */
class AuthService {
  /**
   * Inicia sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario y token
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { data } = response.data;

    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario y token
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const { data } = response.data;

    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Usuario
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  }

  /**
   * Cierra sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Obtiene el usuario del localStorage
   * @returns {Object|null}
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obtiene el token del localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
