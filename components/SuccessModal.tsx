import { useEffect } from 'react';
import styles from '@/styles/SuccessModal.module.css';

interface SuccessModalProps {
  onClose: () => void;
  autoCloseDelay?: number; // миллисекунды
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose, autoCloseDelay = 2000 }) => {
  // Автозакрытие через указанное время
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [onClose, autoCloseDelay]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Клик по оверлею (закрытие)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
