/**
 * @fileoverview Экспорт всех кастомных хуков приложения
 */

export { useModal, useAutoClose } from './useModal';
export { useAuth, getStoredToken, getStoredUser, persistAuth, clearAuth } from './useAuth';
export { useUserCourses } from './useUserCourses';
export { UserCoursesProvider } from './UserCoursesProvider';
