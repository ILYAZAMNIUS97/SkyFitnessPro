/**
 * @fileoverview Модальное окно успешного сохранения прогресса
 * Отображается после успешного сохранения и автоматически закрывается
 */

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
}) => {
  // Используем хуки для управления модальным окном
  const { handleOverlayClick } = useModal({ onClose, blockScroll: false });
  useAutoClose(onClose, autoCloseDelay);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          Ваш прогресс
          <br />
          засчитан!
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
