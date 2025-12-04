/**
 * @fileoverview Тесты для компонента RegisterCard
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterCard from '../RegisterCard';

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

describe('RegisterCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Рендеринг', () => {
    it('рендерит форму регистрации с логотипом', () => {
      render(<RegisterCard />);

      expect(screen.getByAltText('SkyFitnessPro')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Эл. почта')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
    });

    it('рендерит форму без логотипа при showLogo=false', () => {
      render(<RegisterCard showLogo={false} />);

      expect(screen.queryByAltText('SkyFitnessPro')).not.toBeInTheDocument();
    });

    it('показывает кнопку переключения на вход при наличии callback', () => {
      const mockSwitch = jest.fn();
      render(<RegisterCard onSwitchToLogin={mockSwitch} />);

      expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    });

    it('не показывает кнопку переключения без callback', () => {
      render(<RegisterCard />);

      expect(screen.queryByRole('button', { name: 'Войти' })).not.toBeInTheDocument();
    });
  });

  describe('Валидация', () => {
    it('показывает ошибку валидации для некорректного email', async () => {
      render(<RegisterCard />);

      const emailInput = screen.getByPlaceholderText('Эл. почта');
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Введите корректный e-mail')).toBeInTheDocument();
      });
    });

    it('показывает ошибку валидации для короткого пароля', async () => {
      render(<RegisterCard />);

      const passwordInput = screen.getByPlaceholderText('Пароль');
      await userEvent.type(passwordInput, '123');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('Минимум 6 символов')).toBeInTheDocument();
      });
    });

    it('показывает ошибку при несовпадении паролей', async () => {
      render(<RegisterCard />);

      const passwordInput = screen.getByPlaceholderText('Пароль');
      const confirmInput = screen.getByPlaceholderText('Повторите пароль');

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'different123');
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.getByText('Пароли должны совпадать')).toBeInTheDocument();
      });
    });

    it('не показывает ошибку при совпадении паролей', async () => {
      render(<RegisterCard />);

      const passwordInput = screen.getByPlaceholderText('Пароль');
      const confirmInput = screen.getByPlaceholderText('Повторите пароль');

      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'password123');
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.queryByText('Пароли должны совпадать')).not.toBeInTheDocument();
      });
    });
  });

  describe('Отправка формы', () => {
    it('отправляет данные при успешной регистрации', async () => {
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

      render(<RegisterCard onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.user);
      });
    });

    it('показывает ошибку сервера при неуспешной регистрации', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Email уже используется' }),
      });

      render(<RegisterCard />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      await waitFor(() => {
        expect(screen.getByText('Email уже используется')).toBeInTheDocument();
      });
    });

    it('показывает сообщение об успехе после регистрации', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: '1', email: 'test@test.com', name: 'Test' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<RegisterCard />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      await waitFor(() => {
        expect(screen.getByText('Регистрация прошла успешно!')).toBeInTheDocument();
      });
    });
  });

  describe('Переключение режимов', () => {
    it('вызывает callback при нажатии на кнопку входа', async () => {
      const mockSwitch = jest.fn();
      render(<RegisterCard onSwitchToLogin={mockSwitch} />);

      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      expect(mockSwitch).toHaveBeenCalled();
    });
  });
});
