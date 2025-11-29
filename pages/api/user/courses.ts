import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'skyfitnesspro-dev-secret';

interface JwtPayload {
  userId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'GET') {
      // Получение списка курсов пользователя
      const courseIds = (user.courses || []).map((id: any) => id.toString());
      return res.status(200).json({
        courses: courseIds,
      });
    }

    if (req.method === 'POST') {
      // Добавление курса пользователю
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: 'ID курса обязателен' });
      }

      // Проверяем, не добавлен ли уже курс
      const courseIds = (user.courses || []).map((id: any) => id.toString());
      if (courseIds.includes(courseId)) {
        return res.status(400).json({ message: 'Курс уже добавлен' });
      }

      // Добавляем курс
      user.courses = user.courses || [];
      user.courses.push(courseId);
      await user.save();

      return res.status(200).json({
        message: 'Курс успешно добавлен',
        courses: (user.courses || []).map((id: any) => id.toString()),
      });
    }

    if (req.method === 'DELETE') {
      // Удаление курса у пользователя
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: 'ID курса обязателен' });
      }

      user.courses = (user.courses || []).filter((id: any) => id.toString() !== courseId);
      await user.save();

      return res.status(200).json({
        message: 'Курс успешно удален',
        courses: (user.courses || []).map((id: any) => id.toString()),
      });
    }

    return res.status(405).json({ message: 'Метод не поддерживается' });
  } catch (error) {
    console.error('Error in courses API:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Невалидный токен' });
    }

    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}
