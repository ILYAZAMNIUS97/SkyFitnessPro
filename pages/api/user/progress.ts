import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: string;
  email: string;
}

type ResponseData = {
  success: boolean;
  message?: string;
  progress?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await dbConnect();

  // Проверка авторизации
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Не авторизован' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return res.status(401).json({ success: false, error: 'Недействительный токен' });
  }

  switch (req.method) {
    case 'GET': {
      // Получить прогресс пользователя по курсу
      try {
        const { courseId } = req.query;

        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }

        let progress = user.progress || [];

        // Фильтруем по курсу, если указан
        if (courseId) {
          progress = progress.filter((p: any) => p.courseId === courseId);
        }

        return res.status(200).json({ success: true, progress });
      } catch (error) {
        console.error('Error getting progress:', error);
        return res.status(500).json({ success: false, error: 'Ошибка сервера' });
      }
    }

    case 'POST': {
      // Сохранить прогресс тренировки
      try {
        const { courseId, workoutId, completedExercises } = req.body;

        if (!courseId || !workoutId || !completedExercises) {
          return res.status(400).json({
            success: false,
            error: 'Необходимо указать courseId, workoutId и completedExercises',
          });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }

        // Ищем существующий прогресс для этой тренировки
        const existingProgressIndex = user.progress.findIndex(
          (p: any) => p.courseId === courseId && p.workoutId === workoutId
        );

        const progressEntry = {
          courseId,
          workoutId,
          completedExercises,
          completedAt: new Date(),
        };

        if (existingProgressIndex !== -1) {
          // Обновляем существующий прогресс
          user.progress[existingProgressIndex] = progressEntry;
        } else {
          // Добавляем новый прогресс
          user.progress.push(progressEntry);
        }

        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Прогресс сохранён',
          progress: progressEntry,
        });
      } catch (error) {
        console.error('Error saving progress:', error);
        return res.status(500).json({ success: false, error: 'Ошибка сервера' });
      }
    }

    default:
      return res.status(405).json({ success: false, error: 'Метод не поддерживается' });
  }
}

