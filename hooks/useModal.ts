/**
 * @fileoverview Кастомные хуки для работы с модальными окнами
 * Инкапсулируют общую логику: закрытие по Escape, клик по оверлею, блокировка скролла
 */

import { useEffect, useCallback } from 'react';

/**
 * Опции для хука useModal
 */
interface UseModalOptions {
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** Закрывать ли по нажатию Escape (по умолчанию true) */
  closeOnEscape?: boolean;
  /** Блокировать ли скролл страницы (по умолчанию true) */
  blockScroll?: boolean;
}

/**
 * Хук для управления поведением модального окна
 * Автоматически обрабатывает закрытие по Escape и блокировку скролла
 *
 * @param options - Опции модального окна
 *
 * @example
 * function MyModal({ onClose }) {
 *   const { handleOverlayClick } = useModal({ onClose });
 *
 *   return (
 *     <div className="overlay" onClick={handleOverlayClick}>
 *       <div className="modal">...</div>
 *     </div>
 *   );
 * }
 */
export function useModal(options: UseModalOptions) {
  const { onClose, closeOnEscape = true, blockScroll = true } = options;

  // Закрытие по Escape
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, closeOnEscape]);

  // Блокировка скролла
  useEffect(() => {
    if (!blockScroll) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [blockScroll]);

  /**
   * Обработчик клика по оверлею
   * Закрывает модальное окно только при клике непосредственно на оверлей
   */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return {
    handleOverlayClick,
  };
}

/**
 * Хук для автозакрытия модального окна через указанное время
 *
 * @param onClose - Функция закрытия
 * @param delay - Задержка в миллисекундах (по умолчанию 2000)
 *
 * @example
 * function SuccessModal({ onClose }) {
 *   useAutoClose(onClose, 3000);
 *   return <div>Успешно!</div>;
 * }
 */
export function useAutoClose(onClose: () => void, delay: number = 2000) {
  useEffect(() => {
    const timer = setTimeout(onClose, delay);
    return () => clearTimeout(timer);
  }, [onClose, delay]);
}

export default useModal;
