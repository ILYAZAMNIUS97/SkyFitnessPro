/**
 * @fileoverview Карточка курса на странице профиля
 * Отображает курс с прогрессом и кнопками управления
 */

import { useCallback } from 'react';
import Link from 'next/link';
import { getProgressButtonText } from '@/lib/utils';
import { ICourse } from '@/types/course';
import styles from '@/styles/ProfileCourseCard.module.css';

/**
 * Props компонента ProfileCourseCard
 */
interface ProfileCourseCardProps {
  /** Данные курса */
  course: ICourse;
  /** Прогресс выполнения (0-100) */
  progress: number;
  /** Callback удаления курса */
  onRemove?: (courseId: string) => void;
  /** Callback начала тренировки */
  onStartWorkout?: (courseId: string) => void;
}

/**
 * Карточка курса в профиле пользователя
 * Показывает прогресс и позволяет управлять курсом
 *
 * @example
 * <ProfileCourseCard
 *   course={course}
 *   progress={75}
 *   onRemove={handleRemove}
 *   onStartWorkout={handleStart}
 * />
 */
const ProfileCourseCard: React.FC<ProfileCourseCardProps> = ({
  course,
  progress,
  onRemove,
  onStartWorkout,
}) => {
  /**
   * Обработчик удаления курса
   */
  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRemove?.(course._id);
    },
    [course._id, onRemove]
  );

  /**
   * Обработчик нажатия на кнопку действия
   */
  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onStartWorkout?.(course._id);
    },
    [course._id, onStartWorkout]
  );

  // Текст кнопки зависит от прогресса
  const buttonText = getProgressButtonText(progress);

  return (
    <div className={styles.card}>
      {/* Изображение курса */}
      <div
        className={styles.imageWrapper}
        style={{ backgroundColor: course.backgroundColor || '#FFC700' }}
      >
        <Link href={`/course/${course._id}`}>
          <img src={course.image} alt={course.nameRU} className={styles.image} />
        </Link>

        {/* Кнопка удаления */}
        <button
          className={styles.removeButton}
          onClick={handleRemoveClick}
          aria-label="Удалить курс"
          title="Удалить курс"
        >
          <svg
            width="14"
            height="4"
            viewBox="0 0 14 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 2H14" stroke="white" strokeWidth="3" />
          </svg>
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

        {/* Прогресс */}
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>Прогресс {progress}%</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Кнопка действия */}
        <button className={styles.actionButton} onClick={handleButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ProfileCourseCard;
