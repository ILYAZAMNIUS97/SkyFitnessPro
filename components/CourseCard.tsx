/**
 * @fileoverview Карточка курса на главной странице
 * Отображает информацию о курсе с возможностью добавления
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getStoredToken, getStoredUser } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import SuccessModal from './SuccessModal';
import { ICourse } from '@/types/course';
import styles from '@/styles/CourseCard.module.css';

/**
 * Props компонента CourseCard
 */
interface CourseCardProps {
  /** Данные курса */
  course: ICourse;
}

/**
 * Карточка курса на главной странице
 * Позволяет просматривать информацию и добавлять курс в профиль
 *
 * @example
 * <CourseCard course={courseData} />
 */
const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  // Состояние компонента
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCourse, setHasCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Проверяет, добавлен ли курс у пользователя
   */
  const checkUserCourse = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const response = await fetch('/api/user/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHasCourse(data.courses?.includes(course._id) ?? false);
      }
    } catch (error) {
      console.error('Ошибка проверки курсов:', error);
    }
  }, [course._id]);

  // Проверка авторизации при монтировании
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user) {
      setIsAuthenticated(true);
      checkUserCourse();
    }
  }, [checkUserCourse]);

  /**
   * Обработчик добавления курса
   */
  const handleAddClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Если не авторизован - показываем модальное окно
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }

      // Если курс уже добавлен - переходим в профиль
      if (hasCourse) {
        router.push('/profile');
        return;
      }

      // Добавляем курс
      setIsLoading(true);
      try {
        const token = getStoredToken();
        const response = await fetch('/api/user/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course._id }),
        });

        if (response.ok) {
          setHasCourse(true);
          setShowSuccessModal(true);
        } else {
          const data = await response.json();
          alert(data.message || 'Ошибка при добавлении курса');
        }
      } catch (error) {
        console.error('Ошибка добавления курса:', error);
        alert('Произошла ошибка при добавлении курса');
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, hasCourse, course._id, router]
  );

  /**
   * Обработчик успешной авторизации
   */
  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    setIsAuthenticated(true);
    checkUserCourse();
  }, [checkUserCourse]);

  return (
    <>
      <div className={styles.card}>
        {/* Изображение курса */}
        <div
          className={styles.imageWrapper}
          style={{ backgroundColor: course.backgroundColor || '#FFC700' }}
        >
          <Link href={`/course/${course._id}`}>
            <img src={course.image} alt={course.nameRU} className={styles.image} />
          </Link>

          {/* Кнопка добавления */}
          <button
            className={`${styles.addButton} ${hasCourse ? styles.addButtonAdded : ''}`}
            onClick={handleAddClick}
            aria-label={hasCourse ? 'Курс добавлен' : 'Добавить курс'}
            disabled={isLoading}
          >
            {hasCourse ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <img src="/img/icon/plus.svg" alt="+" />
            )}
          </button>
        </div>

        {/* Информация о курсе */}
        <div className={styles.content}>
          <Link href={`/course/${course._id}`}>
            <h3 className={styles.title}>{course.nameRU}</h3>
          </Link>

          {/* Метаданные */}
          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <img src="/img/icon/Calendar.svg" alt="" className={styles.metaIcon} />
                <span>{course.durationInDays} дней</span>
              </div>
              <div className={styles.metaItem}>
                <img src="/img/icon/time.svg" alt="" className={styles.metaIcon} />
                <span>
                  {course.dailyDurationInMinutes.from}-{course.dailyDurationInMinutes.to} мин/день
                </span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <img src="/img/icon/mingcute_signal-fill.svg" alt="" className={styles.metaIcon} />
              <span>Сложность</span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно авторизации */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      )}

      {/* Модальное окно успешного добавления курса */}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} title="Курс добавлен!" />
      )}
    </>
  );
};

export default CourseCard;
