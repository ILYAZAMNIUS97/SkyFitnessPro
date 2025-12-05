/**
 * @fileoverview Контейнер авторизации с переключением между формами входа и регистрации
 * Использует отдельные компоненты LoginCard и RegisterCard
 */

import { useState, useCallback } from 'react';
import LoginCard from './LoginCard';
import RegisterCard from './RegisterCard';
import { AuthUser } from '@/types/auth';

/** Режим авторизации: вход или регистрация */
export type AuthMode = 'login' | 'register';

// ============================================================================
// Типы
// ============================================================================

/**
 * Props компонента AuthCard
 */
export interface AuthCardProps {
  /** Callback при успешной авторизации */
  onSuccess?: (user: AuthUser) => void;
  /** Начальный режим (по умолчанию 'login') */
  initialMode?: AuthMode;
}

// ============================================================================
// Компонент
// ============================================================================

/**
 * Контейнер авторизации
 * Отображает форму входа или регистрации с возможностью переключения между ними
 *
 * @example
 * <AuthCard onSuccess={(user) => console.log('Авторизован:', user)} />
 *
 * @example
 * // Начать с формы регистрации
 * <AuthCard initialMode="register" onSuccess={handleSuccess} />
 */
export default function AuthCard({ onSuccess, initialMode = 'login' }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  /**
   * Переключение на форму регистрации
   */
  const handleSwitchToRegister = useCallback(() => {
    setMode('register');
  }, []);

  /**
   * Переключение на форму входа
   */
  const handleSwitchToLogin = useCallback(() => {
    setMode('login');
  }, []);

  // Отображение формы входа
  if (mode === 'login') {
    return (
      <LoginCard
        onSuccess={onSuccess}
        onSwitchToRegister={handleSwitchToRegister}
        showLogo={true}
      />
    );
  }

  // Отображение формы регистрации
  return (
    <RegisterCard onSuccess={onSuccess} onSwitchToLogin={handleSwitchToLogin} showLogo={true} />
  );
}

// Реэкспорт компонентов для удобства использования
export { default as LoginCard } from './LoginCard';
export { default as RegisterCard } from './RegisterCard';
export type { LoginCardProps } from './LoginCard';
export type { RegisterCardProps } from './RegisterCard';
export type { LoginFormValues } from './LoginCard';
export type { RegisterFormValues } from './RegisterCard';
