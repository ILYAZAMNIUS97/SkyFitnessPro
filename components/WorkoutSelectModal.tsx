import { useEffect } from 'react';
import styles from '@/styles/WorkoutSelectModal.module.css';
import { IWorkout, IUserProgress } from '@/types/course';

interface WorkoutSelectModalProps {
  workouts: IWorkout[];
  courseName: string;
  selectedWorkoutId: string | null;
  userProgress: IUserProgress[];
  onSelect: (workoutId: string) => void;
  onClose: () => void;
}

const WorkoutSelectModal: React.FC<WorkoutSelectModalProps> = ({
  workouts,
  courseName,
  selectedWorkoutId,
  userProgress,
  onSelect,
  onClose,
}) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Проверяем, завершена ли тренировка
  const isWorkoutCompleted = (workoutId: string) => {
    return userProgress.some((p) => p.workoutId === workoutId && p.completedAt);
  };

  // Клик по оверлею (закрытие)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Выберите тренировку</h2>
        </div>

        <div className={styles.workoutsList}>
          {workouts
            .sort((a, b) => a.order - b.order)
            .map((workout, index) => {
              const isSelected = selectedWorkoutId === workout._id;
              const isCompleted = isWorkoutCompleted(workout._id);

              return (
                <div
                  key={workout._id}
                  className={styles.workoutItem}
                  onClick={() => onSelect(workout._id)}
                >
                  <div
                    className={`${styles.checkbox} ${isSelected ? styles.selected : ''} ${isCompleted ? styles.completed : ''}`}
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
            onClick={() => {
              if (selectedWorkoutId) {
                onSelect(selectedWorkoutId);
                onClose();
              }
            }}
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
