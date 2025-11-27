import { ReactNode, useCallback, useEffect, useState } from 'react';
import Header from './Header';
import ScrollToTop from './ScrollToTop';
import AuthModal from './AuthModal';
import styles from '@/styles/Layout.module.css';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';
import { AuthUser } from '@/types/auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(
    (authUser: AuthUser) => {
      setUser(authUser);
      closeAuthModal();
    },
    [closeAuthModal]
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_USER_KEY);
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUser = window.localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.warn('Failed to parse stored user', error);
        window.localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
  }, []);

  return (
    <div className={styles.layout}>
      <Header onLoginClick={openAuthModal} user={user} onLogout={handleLogout} />
      <main className={styles.main}>
        {children}
        <ScrollToTop />
      </main>
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />}
    </div>
  );
};

export default Layout;
