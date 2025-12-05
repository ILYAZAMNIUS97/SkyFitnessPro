/**
 * @fileoverview Кнопка прокрутки страницы наверх
 * Появляется после прокрутки на определённое расстояние
 */

import { useState, useEffect, useCallback } from 'react';
import { SCROLL_TO_TOP_THRESHOLD } from '@/lib/constants';
import styles from '@/styles/ScrollToTop.module.css';

/**
 * Кнопка "Наверх"
 * Появляется при прокрутке страницы вниз более чем на SCROLL_TO_TOP_THRESHOLD пикселей
 *
 * @example
 * // В Layout компоненте
 * <main>
 *   {children}
 *   <ScrollToTop />
 * </main>
 */
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Обработчик события прокрутки
   * Показывает/скрывает кнопку в зависимости от позиции скролла
   */
  const handleScroll = useCallback(() => {
    const shouldBeVisible = window.pageYOffset > SCROLL_TO_TOP_THRESHOLD;
    setIsVisible(shouldBeVisible);
  }, []);

  // Подписка на событие прокрутки
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /**
   * Плавная прокрутка к началу страницы
   */
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button onClick={scrollToTop} className={styles.scrollButton} aria-label="Наверх">
      <span>Наверх ↑</span>
    </button>
  );
};

export default ScrollToTop;
