/**
 * @fileoverview Хук для работы с курсами пользователя
 * Предоставляет методы для проверки, добавления и удаления курсов
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getStoredToken } from './useAuth';

/**
 * Результат хука useUserCourses
 */
interface UseUserCoursesReturn {
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
 * Хук для управления курсами пользователя
 * Автоматически загружает список курсов при авторизации
 *
 * @param isAuthenticated - Авторизован ли пользователь
 * @returns Объект с данными и методами управления курсами
 *
 * @example
 * function CourseCard({ course }) {
 *   const { isAuthenticated } = useAuth();
 *   const { hasCourse, addCourse, isLoading } = useUserCourses(isAuthenticated);
 *
 *   const handleAdd = async () => {
 *     const success = await addCourse(course._id);
 *     if (success) router.push('/profile');
 *   };
 *
 *   return (
 *     <button onClick={handleAdd} disabled={isLoading}>
 *       {hasCourse(course._id) ? 'Добавлен' : 'Добавить'}
 *     </button>
 *   );
 * }
 */
export function useUserCourses(isAuthenticated: boolean): UseUserCoursesReturn {
  const router = useRouter();
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Загружает список курсов пользователя
   */
  const fetchCourses = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
    } else {
      setCourseIds([]);
    }
  }, [isAuthenticated, fetchCourses]);

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

  return {
    courseIds,
    hasCourse,
    addCourse,
    removeCourse,
    isLoading,
    refresh: fetchCourses,
  };
}

export default useUserCourses;
