/**
 * @fileoverview Хук для работы с курсами пользователя
 * Использует глобальное состояние из UserCoursesContext
 */

import { useContext } from 'react';
import { UserCoursesContext } from './UserCoursesProvider';

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
 * Использует глобальное состояние из UserCoursesContext
 * Данные загружаются один раз на уровне приложения через UserCoursesProvider
 *
 * @returns Объект с данными и методами управления курсами
 *
 * @example
 * function CourseCard({ course }) {
 *   const { hasCourse, addCourse, isLoading } = useUserCourses();
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
export function useUserCourses(): UseUserCoursesReturn {
  const context = useContext(UserCoursesContext);

  if (!context) {
    // Возвращаем значения по умолчанию, если контекст не доступен
    // Это может произойти, если хук используется вне UserCoursesProvider
    return {
      courseIds: [],
      hasCourse: () => false,
      addCourse: async () => false,
      removeCourse: async () => false,
      isLoading: false,
      refresh: async () => {},
    };
  }

  return context;
}

export default useUserCourses;
