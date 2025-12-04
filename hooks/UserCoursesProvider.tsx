/**
 * @fileoverview Provider для глобального состояния курсов пользователя
 * Обеспечивает единую точку загрузки и хранения курсов пользователя
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getStoredToken, getStoredUser } from './useAuth';

/**
 * Контекст курсов пользователя
 */
interface UserCoursesContextValue {
  /** ID курсов пользователя */
  courseIds: string[];
  /** Проверяет, добавлен ли курс у пользователя */
  hasCourse: (courseId: string) => boolean;
  /** Добавляет курс пользователю */
  addCourse: (courseId: string) => Promise<boolean>;
  /** Удаляет курс у пользователя */
  removeCourse: (courseId: string) => Promise<boolean>;
  /** Идёт ли загрузка */
  isLoading: boolean;
  /** Обновить список курсов */
  refresh: () => Promise<void>;
}

/**
 * Context для курсов пользователя
 */
export const UserCoursesContext = createContext<UserCoursesContextValue | null>(null);

/**
 * Props для UserCoursesProvider
 */
interface UserCoursesProviderProps {
  /** Дочерние компоненты */
  children: ReactNode;
}

/**
 * Provider для курсов пользователя
 * Загружает курсы пользователя один раз при авторизации
 * и предоставляет методы для работы с курсами
 */
export function UserCoursesProvider({ children }: UserCoursesProviderProps) {
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Проверяет авторизацию пользователя
   */
  const checkAuth = useCallback(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    return !!(token && user);
  }, []);

  /**
   * Загружает список курсов пользователя
   */
  const fetchCourses = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCourseIds([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourseIds(data.courses || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Проверяет, добавлен ли курс
   */
  const hasCourse = useCallback(
    (courseId: string): boolean => {
      return courseIds.includes(courseId);
    },
    [courseIds]
  );

  /**
   * Добавляет курс пользователю
   * @returns true если успешно, false если ошибка
   */
  const addCourse = useCallback(async (courseId: string): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) return false;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourseIds(data.courses || []);
        return true;
      } else {
        const data = await response.json();
        console.error('Ошибка добавления курса:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Ошибка добавления курса:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Удаляет курс у пользователя
   * @returns true если успешно, false если ошибка
   */
  const removeCourse = useCallback(async (courseId: string): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) return false;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourseIds(data.courses || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка удаления курса:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Проверка авторизации и загрузка курсов при монтировании
   */
  useEffect(() => {
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchCourses();
    } else {
      setCourseIds([]);
    }
  }, [checkAuth, fetchCourses]);

  /**
   * Слушаем изменения авторизации через событие
   */
  useEffect(() => {
    const handleAuthChange = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        fetchCourses();
      } else {
        setCourseIds([]);
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [checkAuth, fetchCourses]);

  const contextValue: UserCoursesContextValue = {
    courseIds,
    hasCourse,
    addCourse,
    removeCourse,
    isLoading,
    refresh: fetchCourses,
  };

  return <UserCoursesContext.Provider value={contextValue}>{children}</UserCoursesContext.Provider>;
}

export default UserCoursesProvider;
