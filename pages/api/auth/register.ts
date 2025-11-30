/**
 * @fileoverview API роут для регистрации нового пользователя
 * @route POST /api/auth/register
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken } from '@/lib/auth';
import { HTTP_STATUS, API_MESSAGES, BCRYPT_SALT_ROUNDS } from '@/lib/constants';

/**
 * Тип ответа API регистрации
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
 * Обработчик регистрации нового пользователя
 *
 * @param req - Запрос с email, password и confirmPassword в body
 * @param res - Ответ с токеном и данными пользователя
 *
 * @example
 * // POST /api/auth/register
 * // Body: { email: "user@example.com", password: "123456", confirmPassword: "123456" }
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

  const { email, password, confirmPassword, name } = req.body ?? {};

  // Валидация обязательных полей
  if (!email || !password || !confirmPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Заполните обязательные поля',
    });
  }

  // Проверка совпадения паролей
  if (password !== confirmPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Пароли не совпадают',
    });
  }

  try {
    await dbConnect();

    // Нормализация email
    const normalizedEmail = String(email).toLowerCase().trim();

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Данная почта уже используется. Попробуйте войти.',
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Формирование имени пользователя
    const userName =
      (typeof name === 'string' && name.trim()) ||
      normalizedEmail.split('@')[0] ||
      'Новый пользователь';

    // Создание пользователя
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: userName,
    });

    // Создание токена
    const token = createToken(user._id.toString());

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Пользователь создан',
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Не удалось завершить регистрацию',
    });
  }
}
