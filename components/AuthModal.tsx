/**
 * @fileoverview Модальное окно авторизации
 * Отображает форму входа/регистрации в модальном окне
 */

import { useModal } from '@/hooks/useModal';
import AuthCard from './AuthCard';
import styles from '@/styles/AuthModal.module.css';
import { AuthUser } from '@/types/auth';

/**
 * Props компонента AuthModal
 */
interface AuthModalProps {
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** Callback при успешной авторизации */
  onSuccess?: (user: AuthUser) => void;
}

/**
 * Модальное окно авторизации
 * Использует AuthCard для отображения формы
 *
 * @example
 * {showAuth && (
 *   <AuthModal
 *     onClose={() => setShowAuth(false)}
 *     onSuccess={(user) => handleAuthSuccess(user)}
 *   />
 * )}
 */
const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  // Используем хук для управления модальным окном
  const { handleOverlayClick } = useModal({
    onClose,
    closeOnEscape: true,
    blockScroll: true,
  });

  /**
   * Обработчик успешной авторизации
   * Закрывает модальное окно и вызывает callback
   */
  const handleSuccess = (user: AuthUser) => {
    onSuccess?.(user);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <AuthCard onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;
