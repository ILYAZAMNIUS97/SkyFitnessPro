/**
 * @fileoverview Типы данных для курсов, тренировок и прогресса
 */

/**
 * Интерфейс курса
 */
export interface ICourse {
  /** Уникальный идентификатор курса */
  _id: string;
  /** Название на русском */
  nameRU: string;
  /** Название на английском */
  nameEN: string;
  /** Описание курса */
  description: string;
  /** URL изображения для карточки на главной странице */
  image: string;
  /** URL изображения для hero-баннера на странице курса */
  heroImage?: string;
  /** Направления курса (теги) */
  directions: string[];
  /** Для кого подходит курс */
  fitting: string[];
  /** Уровень сложности */
  difficulty: string;
  /** Продолжительность курса в днях */
  durationInDays: number;
  /** Продолжительность ежедневных тренировок */
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  /** ID тренировок курса */
  workouts: string[];
  /** Цвет фона для карточки */
  backgroundColor?: string;
  /** Дата создания */
  createdAt?: Date | string;
  /** Дата обновления */
  updatedAt?: Date | string;
}

/**
 * Интерфейс тренировки
 */
export interface IWorkout {
  /** Уникальный идентификатор тренировки */
  _id: string;
  /** ID курса */
  courseId: string;
  /** Название тренировки */
  title: string;
  /** Описание тренировки */
  description: string;
  /** URL видео тренировки */
  videoUrl?: string;
  /** Список упражнений */
  exercises: IExercise[];
  /** Порядковый номер тренировки */
  order: number;
  /** Дата создания */
  createdAt: Date;
  /** Дата обновления */
  updatedAt: Date;
}

/**
 * Интерфейс упражнения
 */
export interface IExercise {
  /** Внутренний ID (опционально) */
  _id?: string;
  /** Название упражнения */
  name: string;
  /** Целевое количество */
  quantity: number;
  /** Единица измерения */
  unit?: 'повторения' | 'минуты' | 'секунды';
}

/**
 * Интерфейс пользователя
 */
export interface IUser {
  /** Уникальный идентификатор */
  _id: string;
  /** Email пользователя */
  email: string;
  /** Хешированный пароль */
  password: string;
  /** Имя пользователя */
  name: string;
  /** ID курсов пользователя */
  courses: string[];
  /** Прогресс по тренировкам */
  progress: IUserProgress[];
  /** Дата создания */
  createdAt: Date;
  /** Дата обновления */
  updatedAt: Date;
}

/**
 * Интерфейс прогресса пользователя по тренировке
 */
export interface IUserProgress {
  /** ID курса */
  courseId: string;
  /** ID тренировки */
  workoutId: string;
  /** Выполненные упражнения */
  completedExercises: {
    /** Название упражнения */
    exerciseName: string;
    /** Количество выполненных повторений */
    completed: number;
  }[];
  /** Дата завершения */
  completedAt?: Date;
}
