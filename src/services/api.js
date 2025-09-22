const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://docmaster.digital/api';

console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL
});

// Утилита для выполнения HTTP запросов
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🚀 ApiService initialized with baseURL:', this.baseURL);
  }

  // Получить токен из localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Получить заголовки для запросов
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Using auth token:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No auth token found in localStorage');
      }
    }

    return headers;
  }

  // Базовый метод для выполнения запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    console.log('🌐 Making API request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📋 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      console.error('Request details:', { url, config });
      throw error;
    }
  }

  // GET запрос
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST запрос
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT запрос
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE запрос
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Создаем экземпляр сервиса
const apiService = new ApiService();

// API методы для аутентификации
export const authApi = {
  // Авторизация пользователя
  login: async (credentials) => {
    return apiService.post('/auth/login', credentials, { auth: false });
  },

  // Получить список пользователей для выбора при логине
  getUsers: async () => {
    return apiService.get('/auth/users', { auth: false });
  },

  // Получить информацию о текущем пользователе
  getCurrentUser: async () => {
    return apiService.get('/auth/me');
  },

  // Обновить токен
  refreshToken: async () => {
    return apiService.post('/auth/refresh');
  },
};

// API методы для управления пользователями
export const usersApi = {
  // Получить список пользователей
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiService.get(`/users?${queryParams}`);
  },

  // Получить пользователя по ID
  getUserById: async (id) => {
    return apiService.get(`/users/${id}`);
  },

  // Создать нового пользователя
  createUser: async (userData) => {
    return apiService.post('/users', userData);
  },

  // Обновить пользователя
  updateUser: async (id, userData) => {
    return apiService.put(`/users/${id}`, userData);
  },

  // Деактивировать пользователя
  deleteUser: async (id) => {
    return apiService.delete(`/users/${id}`);
  },

  // Восстановить пользователя
  restoreUser: async (id) => {
    return apiService.post(`/users/${id}/restore`);
  },

  // Получить пользователей по роли
  getUsersByRole: async (role) => {
    return apiService.get(`/users/by-role/${role}`);
  },

  // Получить статистику для дашборда
  getDashboardStats: async () => {
    return apiService.get('/users/stats/dashboard');
  },
};

// Утилиты для работы с API
export const apiUtils = {
  // Проверить доступность API
  checkHealth: async () => {
    try {
      return await apiService.get('/health', { auth: false });
    } catch (error) {
      throw new Error('API недоступен');
    }
  },

  // Обработать ошибки API
  handleApiError: (error) => {
    if (error.message.includes('401')) {
      // Токен истек, нужно разлогинить пользователя
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return 'Сессия истекла, войдите заново';
    }

    if (error.message.includes('403')) {
      return 'Нет прав доступа к этому ресурсу';
    }

    if (error.message.includes('404')) {
      return 'Ресурс не найден';
    }

    if (error.message.includes('500')) {
      return 'Внутренняя ошибка сервера';
    }

    return error.message || 'Произошла неизвестная ошибка';
  },
};

export default apiService;
