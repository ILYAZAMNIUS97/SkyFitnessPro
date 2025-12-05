/**
 * @fileoverview API роут для получения тренировок курса
 * @route GET /api/workouts/[id]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Workout from '@/models/Workout';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';
import { IWorkout } from '@/types/course';

/**
 * Тип ответа API тренировок
 */
interface WorkoutsResponse {
  success: boolean;
  data?: IWorkout | IWorkout[];
  error?: string;
}

/**
 * Обработчик получения тренировок
 * Поиск происходит по courseId
 *
 * @param req - Запрос с id курса в параметрах
 * @param res - Ответ с массивом тренировок
 *
 * @example
 * // GET /api/workouts/courseId123
 * // Response: { success: true, data: [workout1, workout2, ...] }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<WorkoutsResponse>) {
  // Проверка метода
  if (req.method !== 'GET') {
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      error: API_MESSAGES.METHOD_NOT_ALLOWED,
    });
  }

  const { id } = req.query;
  const courseId = String(id);

  await dbConnect();

  try {
    // Поиск тренировок по courseId
    let workouts = await Workout.find({ courseId }).sort({ order: 1 });

    // Если не нашли, пробуем альтернативный формат courseId
    if (workouts.length === 0) {
      try {
        const mongoose = await import('mongoose');
        if (mongoose.Types.ObjectId.isValid(courseId)) {
          const objectId = new mongoose.Types.ObjectId(courseId);
          workouts = await Workout.find({ courseId: objectId.toString() }).sort({
            order: 1,
          });
        }
      } catch {
        // Игнорируем ошибку конвертации ObjectId
      }
    }

    // Если тренировки найдены
    if (workouts.length > 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: workouts,
      });
    }

    // Пробуем найти по _id (если передан ID тренировки, а не курса)
    const singleWorkout = await Workout.findById(courseId);

    if (singleWorkout) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: singleWorkout,
      });
    }

    // Тренировки не найдены
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: API_MESSAGES.WORKOUTS_NOT_FOUND,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Не удалось получить тренировки',
    });
  }
}
