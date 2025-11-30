/**
 * @fileoverview Типы данных для аутентификации
 */

/**
 * Интерфейс авторизованного пользователя
 * Используется на клиенте после успешной авторизации
 */
export interface AuthUser {
  /** Уникальный идентификатор пользователя */
  _id: string;
  /** Email пользователя */
  email: string;
  /** Имя пользователя для отображения */
  name: string;
}

/**
 * Интерфейс ответа API авторизации
 */
export interface AuthResponse {
  /** Успешность операции */
  success: boolean;
  /** Сообщение (ошибка или успех) */
  message?: string;
  /** JWT токен */
  token?: string;
  /** Данные пользователя */
  user?: AuthUser;
}

/**
 * Интерфейс данных для входа
 */
export interface LoginCredentials {
  /** Email */
  email: string;
  /** Пароль */
  password: string;
}

/**
 * Интерфейс данных для регистрации
 */
export interface RegisterCredentials extends LoginCredentials {
  /** Подтверждение пароля */
  confirmPassword: string;
  /** Имя пользователя (опционально) */
  name?: string;
}
