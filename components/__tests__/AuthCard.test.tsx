/**
 * @fileoverview Тесты для компонента AuthCard (контейнер)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthCard from '../AuthCard';

// Мок для next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Мок для хука useAuth
jest.mock('@/hooks/useAuth', () => ({
  persistAuth: jest.fn(),
}));

// Мок для fetch
global.fetch = jest.fn();

describe('AuthCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Форма входа', () => {
    it('рендерит форму входа по умолчанию', () => {
      render(<AuthCard />);

      expect(screen.getByPlaceholderText('Эл. почта')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    });

    it('показывает ошибку валидации для некорректного email', async () => {
      render(<AuthCard />);

      const emailInput = screen.getByPlaceholderText('Эл. почта');
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Введите корректный e-mail')).toBeInTheDocument();
      });
    });

    it('показывает ошибку валидации для короткого пароля', async () => {
      render(<AuthCard />);

      const passwordInput = screen.getByPlaceholderText('Пароль');
      await userEvent.type(passwordInput, '123');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('Минимум 6 символов')).toBeInTheDocument();
      });
    });
  });

  describe('Переключение режимов', () => {
    it('переключает на форму регистрации', async () => {
      render(<AuthCard />);

      const registerButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
      await userEvent.click(registerButton);

      expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
    });

    it('переключает обратно на форму входа', async () => {
      render(<AuthCard />);

      // Переключаемся на регистрацию
      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      // Переключаемся обратно на вход
      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      expect(screen.queryByPlaceholderText('Повторите пароль')).not.toBeInTheDocument();
    });

    it('поддерживает initialMode="register"', () => {
      render(<AuthCard initialMode="register" />);

      expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
    });
  });

  describe('Форма регистрации', () => {
    it('показывает ошибку при несовпадении паролей', async () => {
      render(<AuthCard />);

      // Переключаемся на регистрацию
      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      const passwordInput = screen.getByPlaceholderText('Пароль');
      const confirmInput = screen.getByPlaceholderText('Повторите пароль');

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'different123');
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.getByText('Пароли должны совпадать')).toBeInTheDocument();
      });
    });
  });

  describe('Отправка формы', () => {
    it('отправляет данные при успешном входе', async () => {
      const mockOnSuccess = jest.fn();
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: '1', email: 'test@test.com', name: 'Test' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<AuthCard onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.user);
      });
    });

    it('показывает ошибку сервера при неуспешном входе', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Неверный пароль' }),
      });

      render(<AuthCard />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      await waitFor(() => {
        expect(screen.getByText('Неверный пароль')).toBeInTheDocument();
      });
    });
  });
});
