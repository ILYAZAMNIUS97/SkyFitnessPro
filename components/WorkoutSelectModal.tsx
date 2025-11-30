/**
 * @fileoverview Модальное окно выбора тренировки
 * Отображает список тренировок курса с индикацией прогресса
 */

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
  // Используем хук для управления модальным окном
  const { handleOverlayClick } = useModal({ onClose });

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
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Выберите тренировку</h2>
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
