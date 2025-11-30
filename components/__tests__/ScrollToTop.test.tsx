/**
 * @fileoverview Тесты для компонента ScrollToTop
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ScrollToTop from '../ScrollToTop';
import { SCROLL_TO_TOP_THRESHOLD } from '@/lib/constants';

describe('ScrollToTop', () => {
  const originalScrollTo = window.scrollTo;
  const originalPageYOffset = Object.getOwnPropertyDescriptor(window, 'pageYOffset');

  beforeEach(() => {
    window.scrollTo = jest.fn();
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    if (originalPageYOffset) {
      Object.defineProperty(window, 'pageYOffset', originalPageYOffset);
    }
  });

  it('не отображает кнопку при малой прокрутке', () => {
    Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });

    render(<ScrollToTop />);
    fireEvent.scroll(window);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('отображает кнопку при большой прокрутке', () => {
    render(<ScrollToTop />);

    Object.defineProperty(window, 'pageYOffset', {
      value: SCROLL_TO_TOP_THRESHOLD + 100,
      writable: true,
    });
    fireEvent.scroll(window);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('вызывает scrollTo при клике на кнопку', () => {
    render(<ScrollToTop />);

    Object.defineProperty(window, 'pageYOffset', {
      value: SCROLL_TO_TOP_THRESHOLD + 100,
      writable: true,
    });
    fireEvent.scroll(window);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('содержит текст "Наверх"', () => {
    render(<ScrollToTop />);

    Object.defineProperty(window, 'pageYOffset', {
      value: SCROLL_TO_TOP_THRESHOLD + 100,
      writable: true,
    });
    fireEvent.scroll(window);

    expect(screen.getByText(/наверх/i)).toBeInTheDocument();
  });

  it('имеет aria-label для доступности', () => {
    render(<ScrollToTop />);

    Object.defineProperty(window, 'pageYOffset', {
      value: SCROLL_TO_TOP_THRESHOLD + 100,
      writable: true,
    });
    fireEvent.scroll(window);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Наверх');
  });

  it('скрывает кнопку при прокрутке обратно вверх', () => {
    render(<ScrollToTop />);

    // Сначала прокручиваем вниз
    Object.defineProperty(window, 'pageYOffset', {
      value: SCROLL_TO_TOP_THRESHOLD + 100,
      writable: true,
    });
    fireEvent.scroll(window);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Затем прокручиваем обратно вверх
    Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true });
    fireEvent.scroll(window);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
