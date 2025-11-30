/**
 * @fileoverview API роут для управления курсами пользователя
 * @route GET/POST/DELETE /api/user/courses
 */

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';

/**
 * Тип ответа API курсов
 */
interface CoursesResponse {
  success?: boolean;
  message?: string;
  courses?: string[];
  error?: string;
}

/**
 * Обработчик управления курсами пользователя
 *
 * GET - Получение списка ID курсов пользователя
 * POST - Добавление курса пользователю
 * DELETE - Удаление курса у пользователя
 *
 * @requires Authorization Bearer token
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<CoursesResponse>) {
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
        message: API_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Преобразование ID курсов в строки
    const getCourseIds = (): string[] => (user.courses || []).map((id: unknown) => String(id));

    switch (req.method) {
      /**
       * GET /api/user/courses
       * Возвращает массив ID курсов пользователя
       */
      case 'GET': {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          courses: getCourseIds(),
        });
      }

      /**
       * POST /api/user/courses
       * Добавляет курс пользователю
       * Body: { courseId: string }
       */
      case 'POST': {
        const { courseId } = req.body;

        if (!courseId) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: API_MESSAGES.COURSE_ID_REQUIRED,
          });
        }

        // Проверка на дубликат
        const currentCourses = getCourseIds();
        if (currentCourses.includes(courseId)) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: API_MESSAGES.COURSE_ALREADY_ADDED,
          });
        }

        // Добавление курса
        user.courses = user.courses || [];
        user.courses.push(courseId);
        await user.save();

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Курс успешно добавлен',
          courses: getCourseIds(),
        });
      }

      /**
       * DELETE /api/user/courses
       * Удаляет курс у пользователя
       * Body: { courseId: string }
       */
      case 'DELETE': {
        const { courseId } = req.body;

        if (!courseId) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: API_MESSAGES.COURSE_ID_REQUIRED,
          });
        }

        // Удаление курса
        user.courses = (user.courses || []).filter((id: unknown) => String(id) !== courseId);
        await user.save();

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Курс успешно удален',
          courses: getCourseIds(),
        });
      }

      default:
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
          success: false,
          message: API_MESSAGES.METHOD_NOT_ALLOWED,
        });
    }
  } catch (error) {
    console.error('Error in courses API:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: API_MESSAGES.SERVER_ERROR,
    });
  }
}
