/**
 * @fileoverview API роут для входа в аккаунт
 * @route POST /api/auth/login
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken } from '@/lib/auth';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/constants';

/**
 * Тип ответа API авторизации
 */
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

/**
 * Обработчик входа в аккаунт
 *
 * @param req - Запрос с email и password в body
 * @param res - Ответ с токеном и данными пользователя
 *
 * @example
 * // POST /api/auth/login
 * // Body: { email: "user@example.com", password: "123456" }
 * // Response: { success: true, token: "...", user: { _id, email, name } }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  // Проверка метода
  if (req.method !== 'POST') {
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: API_MESSAGES.METHOD_NOT_ALLOWED,
    });
  }

  const { email, password } = req.body ?? {};

  // Валидация входных данных
  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Укажите почту и пароль',
    });
  }

  try {
    await dbConnect();

    // Нормализация email
    const normalizedEmail = String(email).toLowerCase().trim();

    // Поиск пользователя
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Пользователь не найден. Попробуйте зарегистрироваться.',
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Пароль введен неверно, попробуйте ещё раз.',
      });
    }

    // Создание токена
    const token = createToken(user._id.toString());

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Успешный вход',
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Не удалось выполнить вход',
    });
  }
}
