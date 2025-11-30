/**
 * @fileoverview API роут для работы с отдельным курсом
 * @route GET/PUT/DELETE /api/courses/[id]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';
import { ICourse } from '@/types/course';

/**
 * Тип ответа API курса
 */
interface CourseResponse {
  success: boolean;
  data?: ICourse;
  error?: string;
}

/**
 * Обработчик работы с отдельным курсом
 *
 * GET - Получение курса по ID
 * PUT - Обновление курса
 * DELETE - Удаление курса
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<CourseResponse>) {
  const { id } = req.query;

  await dbConnect();

  switch (req.method) {
    /**
     * GET /api/courses/[id]
     * Возвращает курс с заполненными тренировками
     */
    case 'GET': {
      try {
        const course = await Course.findById(id).populate('workouts');

        if (!course) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: API_MESSAGES.COURSE_NOT_FOUND,
          });
        }

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: course,
        });
      } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Не удалось получить курс',
        });
      }
    }

    /**
     * PUT /api/courses/[id]
     * Обновляет данные курса
     * Body: обновляемые поля курса
     */
    case 'PUT': {
      try {
        const course = await Course.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!course) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: API_MESSAGES.COURSE_NOT_FOUND,
          });
        }

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: course,
        });
      } catch (error) {
        console.error('Error updating course:', error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Не удалось обновить курс',
        });
      }
    }

    /**
     * DELETE /api/courses/[id]
     * Удаляет курс
     */
    case 'DELETE': {
      try {
        const result = await Course.deleteOne({ _id: id });

        if (!result.deletedCount) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: API_MESSAGES.COURSE_NOT_FOUND,
          });
        }

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: undefined,
        });
      } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Не удалось удалить курс',
        });
      }
    }

    default:
      return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
        success: false,
        error: API_MESSAGES.METHOD_NOT_ALLOWED,
      });
  }
}
