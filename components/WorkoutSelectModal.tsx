/**
 * @fileoverview Модальное окно выбора тренировки
 * Отображает список тренировок курса с индикацией прогресса
 */

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import styles from '@/styles/WorkoutSelectModal.module.css';
import { IWorkout, IUserProgress } from '@/types/course';

/**
 * Props компонента WorkoutSelectModal
 */
interface WorkoutSelectModalProps {
  /** Список тренировок курса */
  workouts: IWorkout[];
  /** Название курса */
  courseName: string;
  /** ID выбранной тренировки */
  selectedWorkoutId: string | null;
  /** Прогресс пользователя */
  userProgress: IUserProgress[];
  /** Callback выбора тренировки */
  onSelect: (workoutId: string) => void;
  /** Функция закрытия модального окна */
  onClose: () => void;
}

/**
 * Модальное окно выбора тренировки
 * Показывает список тренировок с отметкой о выполнении
 * Не закрывается до выбора тренировки пользователем
 *
 * @example
 * <WorkoutSelectModal
 *   workouts={courseWorkouts}
 *   courseName={course.nameRU}
 *   selectedWorkoutId={selectedId}
 *   userProgress={progress}
 *   onSelect={handleSelect}
 *   onClose={() => setShowSelect(false)}
 * />
 */
const WorkoutSelectModal: React.FC<WorkoutSelectModalProps> = ({
  workouts,
  courseName,
  selectedWorkoutId,
  userProgress,
  onSelect,
  onClose,
}) => {
  // Состояние для отображения предупреждения
  const [showWarning, setShowWarning] = useState(false);

  // Используем хук для управления модальным окном (отключаем закрытие по Escape)
  useModal({
    onClose: () => {},
    closeOnEscape: false,
  });

  // Очищаем предупреждение при выборе workout
  useEffect(() => {
    if (selectedWorkoutId) {
      setShowWarning(false);
    }
  }, [selectedWorkoutId]);

  // Обработка закрытия по Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Если выбран workout, разрешаем закрытие
        if (selectedWorkoutId) {
          onClose();
        } else {
          // Показываем предупреждение
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedWorkoutId, onClose]);

  /**
   * Кастомный обработчик клика по overlay
   * Блокирует закрытие модального окна, если не выбран workout
   * Показывает предупреждение при попытке закрыть без выбора
   */
  const handleOverlayClick = (event: React.MouseEvent) => {
    // Разрешаем закрытие только если выбран workout
    if (selectedWorkoutId) {
      // Используем стандартную логику закрытия только для проверки клика по overlay
      if (event.target === event.currentTarget) {
        onClose();
      }
    } else {
      // Показываем предупреждение при попытке закрыть без выбора
      if (event.target === event.currentTarget) {
        setShowWarning(true);
        // Скрываем предупреждение через 3 секунды
        setTimeout(() => setShowWarning(false), 3000);
      }
    }
  };

  /**
   * Проверяет, завершена ли тренировка
   */
  const isWorkoutCompleted = (workoutId: string): boolean => {
    return userProgress.some((p) => p.workoutId === workoutId && p.completedAt);
  };

  /**
   * Обработчик нажатия кнопки "Начать"
   */
  const handleStartClick = () => {
    if (selectedWorkoutId) {
      onSelect(selectedWorkoutId);
      onClose();
    }
  };

  // Сортировка тренировок по порядку
  const sortedWorkouts = [...workouts].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Выберите тренировку</h2>
          {showWarning && <div className={styles.warning}>Выберите упражнение из списка</div>}
        </div>

        <div className={styles.workoutsList}>
          {sortedWorkouts.map((workout, index) => {
            const isSelected = selectedWorkoutId === workout._id;
            const isCompleted = isWorkoutCompleted(workout._id);

            return (
              <div
                key={workout._id}
                className={styles.workoutItem}
                onClick={() => onSelect(workout._id)}
              >
                <div
                  className={`${styles.checkbox} ${
                    isSelected ? styles.selected : ''
                  } ${isCompleted ? styles.completed : ''}`}
                >
                  {(isSelected || isCompleted) && <span className={styles.checkmark}>✓</span>}
                </div>
                <div className={styles.workoutInfo}>
                  <span className={styles.workoutTitle}>{workout.title}</span>
                  <span className={styles.workoutSubtitle}>
                    {courseName} / {index + 1} день
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitButton}
            onClick={handleStartClick}
            disabled={!selectedWorkoutId}
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSelectModal;
