/**
 * @fileoverview Модальное окно для ввода прогресса тренировки
 * Позволяет пользователю указать количество выполненных упражнений
 */

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import styles from '@/styles/ProgressModal.module.css';
import { IExercise } from '@/types/course';

/**
 * Структура прогресса упражнения
 */
interface ExerciseProgress {
  exerciseName: string;
  completed: number;
}

/**
 * Props компонента ProgressModal
 */
interface ProgressModalProps {
  /** Список упражнений тренировки */
  exercises: IExercise[];
  /** Текущий прогресс пользователя */
  currentProgress: ExerciseProgress[];
  /** Callback сохранения прогресса */
  onSave: (progress: ExerciseProgress[]) => void;
  /** Функция закрытия модального окна */
  onClose: () => void;
}

/**
 * Модальное окно ввода прогресса
 *
 * @example
 * <ProgressModal
 *   exercises={workout.exercises}
 *   currentProgress={userProgress}
 *   onSave={handleSaveProgress}
 *   onClose={() => setShowProgress(false)}
 * />
 */
const ProgressModal: React.FC<ProgressModalProps> = ({
  exercises,
  currentProgress,
  onSave,
  onClose,
}) => {
  // Состояние формы: значения полей ввода
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Используем хук для управления модальным окном
  const { handleOverlayClick } = useModal({ onClose });

  // Инициализация значений формы при монтировании
  useEffect(() => {
    const initial: Record<string, string> = {};

    exercises.forEach((exercise) => {
      const existing = currentProgress.find((p) => p.exerciseName === exercise.name);
      initial[exercise.name] = existing ? String(existing.completed) : '';
    });

    setFormValues(initial);
  }, [exercises, currentProgress]);

  /**
   * Обработчик изменения значения поля
   * Разрешает только числовые значения
   */
  const handleInputChange = (exerciseName: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setFormValues((prev) => ({
        ...prev,
        [exerciseName]: value,
      }));
    }
  };

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const progress: ExerciseProgress[] = exercises.map((exercise) => ({
      exerciseName: exercise.name,
      completed: parseInt(formValues[exercise.name] || '0', 10),
    }));

    onSave(progress);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Мой прогресс</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {exercises.map((exercise) => (
            <div key={exercise.name} className={styles.inputGroup}>
              <label className={styles.label}>
                Сколько раз вы сделали {exercise.name.toLowerCase()}?
              </label>
              <input
                type="number"
                min="0"
                max={exercise.quantity * 2}
                className={styles.input}
                placeholder="0"
                value={formValues[exercise.name] || ''}
                onChange={(e) => handleInputChange(exercise.name, e.target.value)}
              />
            </div>
          ))}
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
