/**
 * @fileoverview Кастомный хук для работы с аутентификацией на клиенте
 * Предоставляет методы для проверки авторизации, получения токена и пользователя
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';
import { AuthUser } from '@/types/auth';

/**
 * Результат хука useAuth
 */
interface UseAuthReturn {
  /** Текущий пользователь или null */
  user: AuthUser | null;
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
  /** Идёт ли загрузка данных авторизации */
  isLoading: boolean;
  /** JWT токен или null */
  token: string | null;
  /** Выход из аккаунта */
  logout: () => void;
  /** Обновить данные пользователя */
  refreshUser: () => void;
  /** Установить пользователя (после успешной авторизации) */
  setUser: (user: AuthUser | null) => void;
}

/**
 * Хук для управления состоянием аутентификации
 * Автоматически загружает данные из localStorage при инициализации
 *
 * @param options - Опции хука
 * @param options.redirectTo - Путь для редиректа неавторизованных (опционально)
 * @returns Объект с данными авторизации и методами
 *
 * @example
 * function ProfilePage() {
 *   const { user, isAuthenticated, isLoading, logout } = useAuth({
 *     redirectTo: '/'
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (!isAuthenticated) return null;
 *
 *   return <div>Привет, {user.name}!</div>;
 * }
 */
export function useAuth(options: { redirectTo?: string } = {}): UseAuthReturn {
  const { redirectTo } = options;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Загружает данные авторизации из localStorage
   */
  const loadAuthData = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      console.warn('Ошибка загрузки данных авторизации:', error);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      if (redirectTo) {
        router.push(redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  /**
   * Выход из аккаунта
   */
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    setUser(null);
    setToken(null);
    router.push('/');
  }, [router]);

  /**
   * Обновляет данные пользователя из localStorage
   */
  const refreshUser = useCallback(() => {
    loadAuthData();
  }, [loadAuthData]);

  return {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    token,
    logout,
    refreshUser,
    setUser,
  };
}

/**
 * Получает токен из localStorage (синхронно)
 * Удобно для использования вне React компонентов
 *
 * @returns Токен или null
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

/**
 * Получает пользователя из localStorage (синхронно)
 *
 * @returns Пользователь или null
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Сохраняет данные авторизации в localStorage
 *
 * @param token - JWT токен
 * @param user - Данные пользователя
 */
export function persistAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

/**
 * Очищает данные авторизации из localStorage
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

export default useAuth;
