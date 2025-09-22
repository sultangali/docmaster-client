import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Проверяем, есть ли сохраненные данные аутентификации
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Получаем актуальные данные пользователя с сервера
          console.log('🔄 Получаем актуальные данные пользователя...');
          const response = await authApi.getCurrentUser();
          
          if (response.success && response.data) {
            console.log('✅ Актуальные данные получены:', {
              role: response.data.user.role,
              hasSupervisor: !!response.data.user.supervisor,
              superviseesCount: response.data.user.supervisees?.length || 0
            });
            setUser(response.data.user);
            // Обновляем localStorage с актуальными данными
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            // Если токен недействителен, очищаем localStorage
            console.log('❌ Токен недействителен, очищаем данные');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Ошибка получения данных пользователя:', error);
          // В случае ошибки используем данные из localStorage
          setUser(JSON.parse(userData));
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    setUser: updateUser,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};