import React, { createContext, useContext, useState } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';
import { ApiError } from '../../../shared/api/http';

interface AuthContextValue {
  user: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  const login = async (username: string, password: string) => {
    try {
      const { data } = await loginApi(username, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('username', username);
      setToken(data.access_token);
      setUser(username);
    } catch (e) {
      throw toUserFacingError(e, 'login');
    }
  };

  const register = async (username: string, password: string, fullName?: string) => {
    try {
      await registerApi({ username, password, full_name: fullName });
    } catch (e) {
      throw toUserFacingError(e, 'register');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Преобразует ошибку в понятное пользователю сообщение.
 * Все реальные причины (401, 5xx, network) уже классифицированы в http.ts.
 */
function toUserFacingError(e: unknown, action: 'login' | 'register'): Error {
  if (e instanceof ApiError) {
    switch (e.kind) {
      case 'network':
        return new Error(
          'Сервис временно недоступен. Возможно, идут технические работы. Попробуйте позже.',
        );
      case 'unauthorized':
        return new Error(
          action === 'login'
            ? 'Неверный логин или пароль'
            : 'Не удалось выполнить регистрацию',
        );
      case 'forbidden':
        return new Error('Регистрация временно закрыта');
      case 'server':
        return new Error('Внутренняя ошибка сервера. Попробуйте позже.');
      case 'client':
        // FastAPI-валидация или осмысленное сообщение от бэка
        return new Error(e.message || 'Ошибка запроса');
      default:
        return new Error('Не удалось выполнить операцию. Попробуйте позже.');
    }
  }

  // На всякий случай — что-то совсем неожиданное
  if (e instanceof Error) return e;
  return new Error('Неизвестная ошибка');
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
