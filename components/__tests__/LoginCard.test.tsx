/**
 * @fileoverview Тесты для компонента LoginCard
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginCard from '../LoginCard';

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

describe('LoginCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Рендеринг', () => {
    it('рендерит форму входа с логотипом', () => {
      render(<LoginCard />);

      expect(screen.getByAltText('SkyFitnessPro')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Эл. почта')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    });

    it('рендерит форму без логотипа при showLogo=false', () => {
      render(<LoginCard showLogo={false} />);

      expect(screen.queryByAltText('SkyFitnessPro')).not.toBeInTheDocument();
    });

    it('показывает кнопку переключения на регистрацию при наличии callback', () => {
      const mockSwitch = jest.fn();
      render(<LoginCard onSwitchToRegister={mockSwitch} />);

      expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
    });

    it('не показывает кнопку переключения без callback', () => {
      render(<LoginCard />);

      expect(screen.queryByRole('button', { name: 'Зарегистрироваться' })).not.toBeInTheDocument();
    });
  });

  describe('Валидация', () => {
    it('показывает ошибку валидации для некорректного email', async () => {
      render(<LoginCard />);

      const emailInput = screen.getByPlaceholderText('Эл. почта');
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Введите корректный e-mail')).toBeInTheDocument();
      });
    });

    it('показывает ошибку валидации для короткого пароля', async () => {
      render(<LoginCard />);

      const passwordInput = screen.getByPlaceholderText('Пароль');
      await userEvent.type(passwordInput, '123');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('Минимум 6 символов')).toBeInTheDocument();
      });
    });

    it('не показывает ошибку для корректного email', async () => {
      render(<LoginCard />);

      const emailInput = screen.getByPlaceholderText('Эл. почта');
      await userEvent.type(emailInput, 'test@test.com');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.queryByText('Введите корректный e-mail')).not.toBeInTheDocument();
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

      render(<LoginCard onSuccess={mockOnSuccess} />);

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

      render(<LoginCard />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      await waitFor(() => {
        expect(screen.getByText('Неверный пароль')).toBeInTheDocument();
      });
    });

    it('показывает сообщение об успехе после входа', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: '1', email: 'test@test.com', name: 'Test' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<LoginCard />);

      await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

      await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

      await waitFor(() => {
        expect(screen.getByText('Добро пожаловать обратно!')).toBeInTheDocument();
      });
    });
  });

  describe('Переключение режимов', () => {
    it('вызывает callback при нажатии на кнопку регистрации', async () => {
      const mockSwitch = jest.fn();
      render(<LoginCard onSwitchToRegister={mockSwitch} />);

      await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

      expect(mockSwitch).toHaveBeenCalled();
    });
  });
});
