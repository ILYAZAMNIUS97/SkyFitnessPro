/**
 * @fileoverview Утилиты аутентификации для серверной части
 * Содержит функции для работы с JWT токенами и проверки авторизации
 */

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, HTTP_STATUS, API_MESSAGES } from './constants';

/**
 * Структура payload JWT токена
 */
export interface JwtPayload {
  /** ID пользователя в MongoDB */
  userId: string;
  /** Email пользователя (опционально) */
  email?: string;
}

/**
 * Результат проверки аутентификации
 */
export interface AuthResult {
  /** Успешна ли аутентификация */
  success: boolean;
  /** Payload из токена (если успешно) */
  payload?: JwtPayload;
  /** Сообщение об ошибке (если неуспешно) */
  error?: string;
  /** HTTP статус код для ответа */
  statusCode?: number;
}

/**
 * Извлекает токен из заголовка Authorization
 * Поддерживает формат "Bearer <token>"
 *
 * @param req - Next.js API запрос
 * @returns Токен или null, если не найден
 *
 * @example
 * const token = extractToken(req);
 * if (!token) {
 *   return res.status(401).json({ error: 'Не авторизован' });
 * }
 */
export function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Поддержка формата "Bearer token" и просто "token"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
}

/**
 * Верифицирует JWT токен и возвращает payload
 *
 * @param token - JWT токен для верификации
 * @returns Результат верификации с payload или ошибкой
 *
 * @example
 * const result = verifyToken(token);
 * if (!result.success) {
 *   return res.status(result.statusCode).json({ error: result.error });
 * }
 * const userId = result.payload.userId;
 */
export function verifyToken(token: string): AuthResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      success: true,
      payload: decoded,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: 'Токен истёк',
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: API_MESSAGES.INVALID_TOKEN,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    return {
      success: false,
      error: API_MESSAGES.SERVER_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

/**
 * Создаёт JWT токен для пользователя
 *
 * @param userId - ID пользователя
 * @param expiresIn - Время жизни токена (по умолчанию '7d')
 * @returns Подписанный JWT токен
 *
 * @example
 * const token = createToken(user._id.toString());
 */
export function createToken(userId: string, expiresIn: string | number = '7d'): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Проверяет аутентификацию запроса
 * Комбинирует извлечение и верификацию токена
 *
 * @param req - Next.js API запрос
 * @returns Результат аутентификации
 *
 * @example
 * const auth = authenticateRequest(req);
 * if (!auth.success) {
 *   return res.status(auth.statusCode || 401).json({ error: auth.error });
 * }
 * const userId = auth.payload!.userId;
 */
export function authenticateRequest(req: NextApiRequest): AuthResult {
  const token = extractToken(req);

  if (!token) {
    return {
      success: false,
      error: API_MESSAGES.UNAUTHORIZED,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    };
  }

  return verifyToken(token);
}

/**
 * Middleware-функция для защищённых API роутов
 * Автоматически отправляет ответ с ошибкой при неуспешной аутентификации
 *
 * @param req - Next.js API запрос
 * @param res - Next.js API ответ
 * @returns Payload токена или null (если ответ уже отправлен)
 *
 * @example
 * export default async function handler(req, res) {
 *   const auth = requireAuth(req, res);
 *   if (!auth) return; // Ответ уже отправлен
 *
 *   const user = await User.findById(auth.userId);
 *   // ...
 * }
 */
export function requireAuth(req: NextApiRequest, res: NextApiResponse): JwtPayload | null {
  const result = authenticateRequest(req);

  if (!result.success) {
    res.status(result.statusCode || HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: result.error,
    });
    return null;
  }

  return result.payload!;
}
