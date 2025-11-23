export interface ICourse {
  _id: string;
  title: string;
  description: string;
  image: string;
  duration: number; // в днях
  difficulty: 'Начальный' | 'Средний' | 'Продвинутый';
  workouts: string[]; // ID тренировок
  backgroundColor?: string; // Цвет фона для изображения
  createdAt: Date;
  updatedAt: Date;
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
  name: string;
  quantity: number; // количество повторений или минут
  unit: 'повторения' | 'минуты' | 'секунды';
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
