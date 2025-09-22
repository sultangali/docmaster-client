import { useAuth as useAuthContext } from '../contexts/AuthContext.jsx';
import { authApi, apiUtils } from '../services/api.js';

// Реэкспортируем useAuth для удобства
export const useAuth = useAuthContext;

export const useAuthActions = () => {
  const { login, logout } = useAuthContext();
  
  const handleLogin = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        return { success: true };
      } else {
        throw new Error(response.message || 'Ошибка авторизации');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleApiError(error);
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Получить список пользователей для выбора при логине
  const getUsers = async () => {
    try {
      const response = await authApi.getUsers();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Ошибка получения пользователей');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleApiError(error);
      return { success: false, error: errorMessage };
    }
  };

  // Проверить текущего пользователя
  const getCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        return { success: true, data: response.data.user };
      } else {
        throw new Error(response.message || 'Ошибка получения данных пользователя');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleApiError(error);
      return { success: false, error: errorMessage };
    }
  };
  
  return {
    login: handleLogin,
    logout: handleLogout,
    getUsers,
    getCurrentUser
  };
};