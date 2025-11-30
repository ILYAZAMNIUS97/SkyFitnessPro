/**
 * @fileoverview Константы приложения SkyFitnessPro
 * Централизованное хранение всех констант для удобства поддержки
 */

/**
 * Секретный ключ для подписи JWT токенов
 * В production используется переменная окружения JWT_SECRET
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'skyfitnesspro-dev-secret';

/**
 * Время жизни JWT токена
 */
export const JWT_EXPIRES_IN = '7d';

/**
 * Соль для хеширования паролей (количество раундов bcrypt)
 */
export const BCRYPT_SALT_ROUNDS = 10;

/**
 * Порядок отображения курсов на главной странице
 */
export const COURSES_DISPLAY_ORDER = ['Йога', 'Стретчинг', 'Фитнес', 'Степ-аэробика', 'Бодифлекс'];

/**
 * Задержка автозакрытия модального окна успеха (мс)
 */
export const SUCCESS_MODAL_AUTO_CLOSE_DELAY = 2000;

/**
 * Порог прокрутки для показа кнопки "Наверх" (px)
 */
export const SCROLL_TO_TOP_THRESHOLD = 300;

/**
 * HTTP статус коды для API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Сообщения об ошибках API
 */
export const API_MESSAGES = {
  METHOD_NOT_ALLOWED: 'Метод не поддерживается',
  UNAUTHORIZED: 'Не авторизован',
  INVALID_TOKEN: 'Недействительный токен',
  USER_NOT_FOUND: 'Пользователь не найден',
  COURSE_NOT_FOUND: 'Курс не найден',
  WORKOUTS_NOT_FOUND: 'Тренировки не найдены',
  COURSE_ALREADY_ADDED: 'Курс уже добавлен',
  COURSE_ID_REQUIRED: 'ID курса обязателен',
  SERVER_ERROR: 'Ошибка сервера',
} as const;
