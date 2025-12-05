/**
 * @fileoverview Основной layout приложения
 * Содержит Header, основной контент и модальное окно авторизации
 */

import { ReactNode, useCallback, useEffect, useState } from 'react';
import Header from './Header';
import ScrollToTop from './ScrollToTop';
import AuthModal from './AuthModal';
import { clearAuth, getStoredUser } from '@/hooks/useAuth';
import styles from '@/styles/Layout.module.css';
import { AuthUser } from '@/types/auth';

/**
 * Props компонента Layout
 */
interface LayoutProps {
  /** Дочерние элементы (содержимое страницы) */
  children: ReactNode;
}

/**
 * Основной layout приложения
 * Оборачивает все страницы и предоставляет общую функциональность
 *
 * @example
 * // В _app.tsx или на странице
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Открытие модального окна авторизации
   */
  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  /**
   * Закрытие модального окна авторизации
   */
  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  /**
   * Обработчик успешной авторизации
   */
  const handleAuthSuccess = useCallback(
    (authUser: AuthUser) => {
      setUser(authUser);
      closeAuthModal();
    },
    [closeAuthModal]
  );

  /**
   * Выход из аккаунта
   */
  const handleLogout = useCallback(() => {
    setUser(null);
    clearAuth();
    // Уведомляем другие компоненты об изменении состояния авторизации
    window.dispatchEvent(new Event('authStateChanged'));
  }, []);

  /**
   * Загрузка данных пользователя из localStorage при монтировании
   */
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  /**
   * Обновление состояния пользователя при изменении авторизации
   * Слушает кастомное событие 'authStateChanged' для синхронизации состояния
   */
  useEffect(() => {
    const handleAuthStateChange = () => {
      const storedUser = getStoredUser();
      setUser(storedUser);
    };

    // Слушаем кастомное событие изменения авторизации
    window.addEventListener('authStateChanged', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  return (
    <div className={styles.layout}>
      {/* Шапка */}
      <Header onLoginClick={openAuthModal} user={user} onLogout={handleLogout} />

      {/* Основной контент */}
      <main className={styles.main}>
        {children}
        <ScrollToTop />
      </main>

      {/* Модальное окно авторизации */}
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />}
    </div>
  );
};

export default Layout;
