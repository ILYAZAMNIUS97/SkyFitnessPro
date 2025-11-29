import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Workout from '@/models/Workout';
import { ICourse, IWorkout } from '@/types/course';

const JWT_SECRET = process.env.JWT_SECRET || 'skyfitnesspro-dev-secret';

interface JwtPayload {
  userId: string;
}

interface CourseWithProgress extends ICourse {
  progress: number;
  totalWorkouts: number;
  completedWorkouts: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  await dbConnect();

  // Проверка авторизации
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Получаем ID курсов пользователя
    const courseIds = (user.courses || []).map((id: any) => id.toString());

    // Получаем полные данные о курсах
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    // Рассчитываем прогресс для каждого курса
    const coursesWithProgress: CourseWithProgress[] = await Promise.all(
      courses.map(async (course: any) => {
        // Получаем все тренировки курса
        const workouts = await Workout.find({ courseId: course._id.toString() }).lean();
        const totalWorkouts = workouts.length || 1; // Минимум 1, чтобы избежать деления на 0

        // Считаем выполненные тренировки
        const userProgress = user.progress || [];
        const courseProgress = userProgress.filter(
          (p: any) => p.courseId === course._id.toString()
        );

        // Считаем уникальные завершённые тренировки
        const completedWorkoutIds = new Set(
          courseProgress
            .filter((p: any) => {
              // Тренировка считается завершённой, если все упражнения выполнены
              const workout = workouts.find((w: any) => w._id.toString() === p.workoutId);
              if (!workout || !workout.exercises) return false;

              const totalExercises = workout.exercises.length;
              const completedExercises = p.completedExercises?.length || 0;

              // Если выполнены все упражнения
              return completedExercises >= totalExercises;
            })
            .map((p: any) => p.workoutId)
        );

        const completedWorkouts = completedWorkoutIds.size;
        const progress = Math.round((completedWorkouts / totalWorkouts) * 100);

        return {
          ...course,
          _id: course._id.toString(),
          progress: Math.min(progress, 100),
          totalWorkouts,
          completedWorkouts,
        };
      })
    );

    return res.status(200).json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      courses: coursesWithProgress,
    });
  } catch (error) {
    console.error('Error in profile API:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Невалидный токен' });
    }

    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}
