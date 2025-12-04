/**
 * @fileoverview Карточка регистрации
 * Содержит форму регистрации с валидацией через React Hook Form и Zod
 */

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { persistAuth } from '@/hooks/useAuth';
import styles from '@/styles/AuthCard.module.css';
import { AuthUser, AuthResponse } from '@/types/auth';

// ============================================================================
// Схема валидации
// ============================================================================

/** Схема валидации формы регистрации */
export const registerSchema = z
  .object({
    email: z.string().email('Введите корректный e-mail'),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string().min(6, 'Подтвердите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли должны совпадать',
    path: ['confirmPassword'],
  });

/** Тип значений формы регистрации */
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ============================================================================
// Типы
// ============================================================================

/**
 * Props компонента RegisterCard
 */
export interface RegisterCardProps {
  /** Callback при успешной регистрации */
  onSuccess?: (user: AuthUser) => void;
  /** Callback для переключения на форму входа */
  onSwitchToLogin?: () => void;
  /** Показывать ли логотип */
  showLogo?: boolean;
}

// ============================================================================
// Компонент
// ============================================================================

/**
 * Карточка регистрации
 * Отображает форму регистрации с валидацией полей
 *
 * @example
 * <RegisterCard
 *   onSuccess={(user) => console.log('Зарегистрирован:', user)}
 *   onSwitchToLogin={() => setMode('login')}
 * />
 */
export default function RegisterCard({
  onSuccess,
  onSwitchToLogin,
  showLogo = true,
}: RegisterCardProps) {
  // Состояние компонента
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Форма регистрации
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  /**
   * Обработчик отправки формы регистрации
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
        if (data.token && data.user) {
          persistAuth(data.token, data.user);
          // Уведомляем Layout об изменении состояния авторизации
          window.dispatchEvent(new Event('authStateChanged'));
        }

        setSuccessMessage('Регистрация прошла успешно!');
        reset();
        onSuccess?.(data.user!);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Произошла ошибка регистрации');
      }
    },
    [reset, onSuccess]
  );

  return (
    <div className={styles.card}>
      {/* Логотип */}
      {showLogo && (
        <div className={styles.logoBlock}>
          <Image src="/img/icon/logo.svg" alt="SkyFitnessPro" width={160} height={36} priority />
        </div>
      )}

      {/* Форма регистрации */}
      <form className={styles.form} onSubmit={handleSubmit(handleRegister)} noValidate>
        <div className={styles.field}>
          <input
            type="email"
            placeholder="Эл. почта"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            {...register('email')}
          />
          {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <input
            type="password"
            placeholder="Пароль"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            {...register('password')}
          />
          {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        </div>

        <div className={styles.field}>
          <input
            type="password"
            placeholder="Повторите пароль"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className={styles.errorText}>{errors.confirmPassword.message}</span>
          )}
        </div>

        {serverError && <div className={styles.serverError}>{serverError}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Отправляем...' : 'Зарегистрироваться'}
        </button>

        {onSwitchToLogin && (
          <button type="button" className={styles.secondaryButton} onClick={onSwitchToLogin}>
            Войти
          </button>
        )}
      </form>
    </div>
  );
}
