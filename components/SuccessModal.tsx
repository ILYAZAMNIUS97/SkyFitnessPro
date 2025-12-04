/**
 * @fileoverview Модальное окно успешного сохранения прогресса
 * Отображается после успешного сохранения и автоматически закрывается
 */

import React from 'react';
import { useModal, useAutoClose } from '@/hooks/useModal';
import { SUCCESS_MODAL_AUTO_CLOSE_DELAY } from '@/lib/constants';
import styles from '@/styles/SuccessModal.module.css';

/**
 * Props компонента SuccessModal
 */
interface SuccessModalProps {
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** Задержка автозакрытия в мс (по умолчанию 2000) */
  autoCloseDelay?: number;
  /** Кастомный заголовок (по умолчанию "Ваш прогресс засчитан!") */
  title?: string;
}

/**
 * Модальное окно успеха
 * Автоматически закрывается через указанное время
 *
 * @example
 * {showSuccess && (
 *   <SuccessModal
 *     onClose={() => setShowSuccess(false)}
 *     autoCloseDelay={3000}
 *   />
 * )}
 */
const SuccessModal: React.FC<SuccessModalProps> = ({
  onClose,
  autoCloseDelay = SUCCESS_MODAL_AUTO_CLOSE_DELAY,
  title = 'Ваш прогресс\nзасчитан!',
}) => {
  // Используем хуки для управления модальным окном
  const { handleOverlayClick } = useModal({ onClose, blockScroll: false });
  useAutoClose(onClose, autoCloseDelay);

  // Разбиваем заголовок на строки, если есть \n
  const titleLines = title.split('\n');

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {titleLines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
        <div className={styles.successIcon}>
          <svg className={styles.checkmark} viewBox="0 0 24 24">
            <path d="M5 12l5 5L20 7" strokeDasharray="30" strokeDashoffset="0" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
