export interface ICourse {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  image: string; // Изображение для карточки на главной странице
  heroImage?: string; // Изображение для hero-баннера на странице курса
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  workouts: string[]; // ID тренировок
  backgroundColor?: string; // Цвет фона для изображения
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IWorkout {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  exercises: IExercise[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExercise {
  _id?: string;
  name: string;
  quantity: number; // количество повторений
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  courses: string[]; // ID курсов, на которые подписан пользователь
  progress: IUserProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProgress {
  courseId: string;
  workoutId: string;
  completedExercises: {
    exerciseName: string;
    completed: number;
  }[];
  completedAt?: Date;
}
