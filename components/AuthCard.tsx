import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from '@/styles/AuthCard.module.css';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';
import { AuthUser } from '@/types/auth';

type AuthMode = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

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

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthCardProps {
  onSuccess?: (user: AuthUser) => void;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

export default function AuthCard({ onSuccess }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setServerError('');
    setSuccessMessage('');
  };

  const persistAuth = (token: string, user: AuthUser) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  };

  const handleLogin = async (values: LoginFormValues) => {
    setServerError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось войти');
      }

      persistAuth(data.token, data.user);
      setSuccessMessage('Добро пожаловать обратно!');
      loginForm.reset();
      onSuccess?.(data.user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Произошла ошибка входа');
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setServerError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось зарегистрироваться');
      }

      persistAuth(data.token, data.user);
      setSuccessMessage('Регистрация прошла успешно!');
      registerForm.reset();
      loginForm.reset({ email: values.email, password: '' });
      setMode('login');
      onSuccess?.(data.user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Произошла ошибка регистрации');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logoBlock}>
        <Image src="/img/icon/logo.svg" alt="SkyFitnessPro" width={160} height={36} priority />
      </div>

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
