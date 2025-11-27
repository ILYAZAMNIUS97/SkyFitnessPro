import { useEffect } from 'react';
import AuthCard from './AuthCard';
import styles from '@/styles/AuthModal.module.css';
import { AuthUser } from '@/types/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSuccess = (user: AuthUser) => {
    onSuccess?.(user);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>
        <AuthCard onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;
