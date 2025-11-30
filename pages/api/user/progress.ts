/**
 * @fileoverview API роут для управления прогрессом тренировок пользователя
 * @route GET/POST /api/user/progress
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';
import { IUserProgress } from '@/types/course';

/**
 * Тип ответа API прогресса
 */
interface ProgressResponse {
  success: boolean;
  message?: string;
  progress?: IUserProgress | IUserProgress[];
  error?: string;
}

/**
 * Обработчик управления прогрессом тренировок
 *
 * GET - Получение прогресса пользователя (опционально по курсу)
 * POST - Сохранение прогресса тренировки
 *
 * @requires Authorization Bearer token
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ProgressResponse>) {
  await dbConnect();

  // Проверка авторизации
  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    // Получение пользователя
    const user = await User.findById(auth.userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: API_MESSAGES.USER_NOT_FOUND,
      });
    }

    switch (req.method) {
      /**
       * GET /api/user/progress
       * Query params: courseId (опционально) - фильтрация по курсу
       * Возвращает массив прогресса пользователя
       */
      case 'GET': {
        const { courseId } = req.query;
        let progress: IUserProgress[] = user.progress || [];

        // Фильтрация по курсу
        if (courseId && typeof courseId === 'string') {
          progress = progress.filter((p: IUserProgress) => p.courseId === courseId);
        }

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          progress,
        });
      }

      /**
       * POST /api/user/progress
       * Сохраняет прогресс тренировки
       * Body: { courseId, workoutId, completedExercises }
       */
      case 'POST': {
        const { courseId, workoutId, completedExercises } = req.body;

        // Валидация входных данных
        if (!courseId || !workoutId || !completedExercises) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Необходимо указать courseId, workoutId и completedExercises',
          });
        }

        // Формирование записи прогресса
        const progressEntry: IUserProgress = {
          courseId,
          workoutId,
          completedExercises,
          completedAt: new Date(),
        };

        // Поиск существующего прогресса
        const existingIndex = user.progress.findIndex(
          (p: IUserProgress) => p.courseId === courseId && p.workoutId === workoutId
        );

        if (existingIndex !== -1) {
          // Обновление существующего прогресса
          user.progress[existingIndex] = progressEntry;
        } else {
          // Добавление нового прогресса
          user.progress.push(progressEntry);
        }

        await user.save();

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Прогресс сохранён',
          progress: progressEntry,
        });
      }

      default:
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
          success: false,
          error: API_MESSAGES.METHOD_NOT_ALLOWED,
        });
    }
  } catch (error) {
    console.error('Error in progress API:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: API_MESSAGES.SERVER_ERROR,
    });
  }
}
