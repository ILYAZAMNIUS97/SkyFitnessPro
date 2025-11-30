/**
 * @fileoverview Карточка авторизации с формами входа и регистрации
 * Содержит валидацию форм через React Hook Form и Zod
 */

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { persistAuth } from '@/hooks/useAuth';
import styles from '@/styles/AuthCard.module.css';
import { AuthUser } from '@/types/auth';

/** Режим авторизации: вход или регистрация */
type AuthMode = 'login' | 'register';

// ============================================================================
// Схемы валидации
// ============================================================================

/** Схема валидации формы входа */
const loginSchema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

/** Схема валидации формы регистрации */
const registerSchema = z
  .object({
    email: z.string().email('Введите корректный e-mail'),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string().min(6, 'Подтвердите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли должны совпадать',
    path: ['confirmPassword'],
  });

/** Тип значений формы входа */
type LoginFormValues = z.infer<typeof loginSchema>;

/** Тип значений формы регистрации */
type RegisterFormValues = z.infer<typeof registerSchema>;

// ============================================================================
// Типы
// ============================================================================

/**
 * Props компонента AuthCard
 */
interface AuthCardProps {
  /** Callback при успешной авторизации */
  onSuccess?: (user: AuthUser) => void;
}

/**
 * Ответ API авторизации
 */
interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

// ============================================================================
// Компонент
// ============================================================================

/**
 * Карточка авторизации
 * Отображает форму входа или регистрации с переключением между ними
 *
 * @example
 * <AuthCard onSuccess={(user) => console.log('Авторизован:', user)} />
 */
export default function AuthCard({ onSuccess }: AuthCardProps) {
  // Состояние компонента
  const [mode, setMode] = useState<AuthMode>('login');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Форма входа
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  // Форма регистрации
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  /**
   * Переключение режима авторизации
   */
  const handleModeChange = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setServerError('');
    setSuccessMessage('');
  }, []);

  /**
   * Обработчик входа
   */
  const handleLogin = useCallback(
    async (values: LoginFormValues) => {
      setServerError('');
      setSuccessMessage('');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data: AuthResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Не удалось войти');
        }

        // Сохраняем данные авторизации
        persistAuth(data.token, data.user);

        setSuccessMessage('Добро пожаловать обратно!');
        loginForm.reset();
        onSuccess?.(data.user);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Произошла ошибка входа');
      }
    },
    [loginForm, onSuccess]
  );

  /**
   * Обработчик регистрации
   */
  const handleRegister = useCallback(
    async (values: RegisterFormValues) => {
      setServerError('');
      setSuccessMessage('');

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data: AuthResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Не удалось зарегистрироваться');
        }

        // Сохраняем данные авторизации
        persistAuth(data.token, data.user);

        setSuccessMessage('Регистрация прошла успешно!');
        registerForm.reset();
        loginForm.reset({ email: values.email, password: '' });
        setMode('login');
        onSuccess?.(data.user);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Произошла ошибка регистрации');
      }
    },
    [loginForm, registerForm, onSuccess]
  );

  return (
    <div className={styles.card}>
      {/* Логотип */}
      <div className={styles.logoBlock}>
        <Image src="/img/icon/logo.svg" alt="SkyFitnessPro" width={160} height={36} priority />
      </div>

      {/* Форма входа */}
      {mode === 'login' ? (
        <form className={styles.form} onSubmit={loginForm.handleSubmit(handleLogin)} noValidate>
          <div className={styles.field}>
            <input
              type="email"
              placeholder="Эл. почта"
              className={`${styles.input} ${
                loginForm.formState.errors.email ? styles.inputError : ''
              }`}
              {...loginForm.register('email')}
            />
            {loginForm.formState.errors.email && (
              <span className={styles.errorText}>{loginForm.formState.errors.email.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <input
              type="password"
              placeholder="Пароль"
              className={`${styles.input} ${
                loginForm.formState.errors.password ? styles.inputError : ''
              }`}
              {...loginForm.register('password')}
            />
            {loginForm.formState.errors.password && (
              <span className={styles.errorText}>
                {loginForm.formState.errors.password.message}
              </span>
            )}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? 'Входим...' : 'Войти'}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => handleModeChange('register')}
          >
            Зарегистрироваться
          </button>
        </form>
      ) : (
        /* Форма регистрации */
        <form
          className={styles.form}
          onSubmit={registerForm.handleSubmit(handleRegister)}
          noValidate
        >
          <div className={styles.field}>
            <input
              type="email"
              placeholder="Эл. почта"
              className={`${styles.input} ${
                registerForm.formState.errors.email ? styles.inputError : ''
              }`}
              {...registerForm.register('email')}
            />
            {registerForm.formState.errors.email && (
              <span className={styles.errorText}>
                {registerForm.formState.errors.email.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <input
              type="password"
              placeholder="Пароль"
              className={`${styles.input} ${
                registerForm.formState.errors.password ? styles.inputError : ''
              }`}
              {...registerForm.register('password')}
            />
            {registerForm.formState.errors.password && (
              <span className={styles.errorText}>
                {registerForm.formState.errors.password.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <input
              type="password"
              placeholder="Повторите пароль"
              className={`${styles.input} ${
                registerForm.formState.errors.confirmPassword ? styles.inputError : ''
              }`}
              {...registerForm.register('confirmPassword')}
            />
            {registerForm.formState.errors.confirmPassword && (
              <span className={styles.errorText}>
                {registerForm.formState.errors.confirmPassword.message}
              </span>
            )}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={registerForm.formState.isSubmitting}
          >
            {registerForm.formState.isSubmitting ? 'Отправляем...' : 'Зарегистрироваться'}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => handleModeChange('login')}
          >
            Войти
          </button>
        </form>
      )}
    </div>
  );
}
