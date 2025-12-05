/**
 * @fileoverview API роут для получения профиля пользователя с курсами и прогрессом
 * @route GET /api/user/profile
 */

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Workout from '@/models/Workout';
import { requireAuth } from '@/lib/auth';
import { calculateProgress } from '@/lib/utils';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';
import { ICourse, IWorkout, IUserProgress } from '@/types/course';

/**
 * Курс с рассчитанным прогрессом
 */
interface CourseWithProgress extends ICourse {
  progress: number;
  totalWorkouts: number;
  completedWorkouts: number;
}

/**
 * Тип ответа API профиля
 */
interface ProfileResponse {
  user?: {
    _id: string;
    email: string;
    name: string;
  };
  courses?: CourseWithProgress[];
  message?: string;
  error?: string;
}

/**
 * Проверяет, завершена ли тренировка (все упражнения выполнены)
 *
 * @param progress - Прогресс пользователя по тренировке
 * @param workout - Данные тренировки
 * @returns true если тренировка завершена
 */
function isWorkoutCompleted(progress: IUserProgress, workout: IWorkout): boolean {
  if (!workout.exercises) return false;

  const totalExercises = workout.exercises.length;
  const completedExercises = progress.completedExercises?.length || 0;

  return completedExercises >= totalExercises;
}

/**
 * Рассчитывает прогресс курса для пользователя
 *
 * @param course - Данные курса
 * @param workouts - Тренировки курса
 * @param userProgress - Прогресс пользователя
 * @returns Курс с данными прогресса
 */
async function calculateCourseProgress(
  course: Record<string, unknown>,
  workouts: IWorkout[],
  userProgress: IUserProgress[]
): Promise<CourseWithProgress> {
  const totalWorkouts = workouts.length || 1;
  const courseId = String(course._id);

  // Фильтруем прогресс по текущему курсу
  const courseProgress = userProgress.filter((p) => p.courseId === courseId);

  // Считаем уникальные завершённые тренировки
  const completedWorkoutIds = new Set(
    courseProgress
      .filter((p) => {
        const workout = workouts.find((w) => String(w._id) === p.workoutId);
        return workout ? isWorkoutCompleted(p, workout) : false;
      })
      .map((p) => p.workoutId)
  );

  const completedWorkouts = completedWorkoutIds.size;
  const progress = calculateProgress(completedWorkouts, totalWorkouts);

  return {
    ...course,
    _id: courseId,
    progress,
    totalWorkouts,
    completedWorkouts,
  } as CourseWithProgress;
}

/**
 * Обработчик получения профиля пользователя
 * Возвращает данные пользователя и его курсы с рассчитанным прогрессом
 *
 * @requires Authorization Bearer token
 *
 * @example
 * // GET /api/user/profile
 * // Headers: { Authorization: "Bearer ..." }
 * // Response: { user: { _id, email, name }, courses: [...] }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileResponse>) {
  // Проверка метода
  if (req.method !== 'GET') {
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      message: API_MESSAGES.METHOD_NOT_ALLOWED,
    });
  }

  await dbConnect();

  // Проверка авторизации
  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    // Получение пользователя
    const user = await User.findById(auth.userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: API_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Получение ID курсов пользователя
    const courseIds = (user.courses || []).map((id: unknown) => String(id));

    // Получение данных курсов
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    // Расчёт прогресса для каждого курса
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const courseIdStr = String(course._id);

        // Получаем тренировки курса
        const workouts = await Workout.find({ courseId: courseIdStr }).lean();

        return calculateCourseProgress(
          course as Record<string, unknown>,
          workouts as IWorkout[],
          user.progress || []
        );
      })
    );

    return res.status(HTTP_STATUS.OK).json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      courses: coursesWithProgress,
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: API_MESSAGES.SERVER_ERROR,
    });
  }
}
