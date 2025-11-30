import { useState, useEffect } from 'react';
import styles from '@/styles/ProgressModal.module.css';
import { IExercise } from '@/types/course';

interface ProgressModalProps {
  exercises: IExercise[];
  currentProgress: { exerciseName: string; completed: number }[];
  onSave: (progress: { exerciseName: string; completed: number }[]) => void;
  onClose: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  exercises,
  currentProgress,
  onSave,
  onClose,
}) => {
  // Инициализируем состояние формы
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    exercises.forEach((exercise) => {
      const existing = currentProgress.find((p) => p.exerciseName === exercise.name);
      initial[exercise.name] = existing ? String(existing.completed) : '';
    });
    setFormValues(initial);
  }, [exercises, currentProgress]);

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

  // Клик по оверлею (закрытие)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Обновление значения поля
  const handleInputChange = (exerciseName: string, value: string) => {
    // Разрешаем только числа
    if (value === '' || /^\d+$/.test(value)) {
      setFormValues((prev) => ({
        ...prev,
        [exerciseName]: value,
      }));
    }
  };

  // Сохранение прогресса
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const progress = exercises.map((exercise) => ({
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
          <button className={styles.submitButton} onClick={handleSubmit}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;

