/**
 * @fileoverview API роут для работы с курсами
 * @route GET/POST /api/courses
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';
import { ICourse } from '@/types/course';

/**
 * Тип ответа API курсов
 */
interface CoursesResponse {
  success: boolean;
  data?: ICourse[];
  error?: string;
}

/**
 * Обработчик работы с коллекцией курсов
 *
 * GET - Получение списка всех курсов
 * POST - Создание нового курса
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<CoursesResponse>) {
  await dbConnect();

  switch (req.method) {
    /**
     * GET /api/courses
     * Возвращает список всех курсов, отсортированных по дате создания
     */
    case 'GET': {
      try {
        const courses = await Course.find({}).sort({ createdAt: -1 });
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: courses,
        });
      } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Не удалось получить курсы',
        });
      }
    }

    /**
     * POST /api/courses
     * Создаёт новый курс
     * Body: данные курса согласно ICourse
     */
    case 'POST': {
      try {
        const course = await Course.create(req.body);
        return res.status(HTTP_STATUS.CREATED).json({
          success: true,
          data: [course],
        });
      } catch (error) {
        console.error('Error creating course:', error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Не удалось создать курс',
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
