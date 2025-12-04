/**
 * @fileoverview Карточка входа в систему
 * Содержит форму входа с валидацией через React Hook Form и Zod
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

/** Схема валидации формы входа */
export const loginSchema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

/** Тип значений формы входа */
export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================================================
// Типы
// ============================================================================

/**
 * Props компонента LoginCard
 */
export interface LoginCardProps {
  /** Callback при успешном входе */
  onSuccess?: (user: AuthUser) => void;
  /** Callback для переключения на форму регистрации */
  onSwitchToRegister?: () => void;
  /** Показывать ли логотип */
  showLogo?: boolean;
}

// ============================================================================
// Компонент
// ============================================================================

/**
 * Карточка входа в систему
 * Отображает форму входа с валидацией полей
 *
 * @example
 * <LoginCard
 *   onSuccess={(user) => console.log('Вошёл:', user)}
 *   onSwitchToRegister={() => setMode('register')}
 * />
 */
export default function LoginCard({
  onSuccess,
  onSwitchToRegister,
  showLogo = true,
}: LoginCardProps) {
  // Состояние компонента
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Форма входа
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  /**
   * Обработчик отправки формы входа
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
        if (data.token && data.user) {
          persistAuth(data.token, data.user);
        }

        setSuccessMessage('Добро пожаловать обратно!');
        reset();
        onSuccess?.(data.user!);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Произошла ошибка входа');
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

      {/* Форма входа */}
      <form className={styles.form} onSubmit={handleSubmit(handleLogin)} noValidate>
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

        {serverError && <div className={styles.serverError}>{serverError}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>

        {onSwitchToRegister && (
          <button type="button" className={styles.secondaryButton} onClick={onSwitchToRegister}>
            Зарегистрироваться
          </button>
        )}
      </form>
    </div>
  );
}
