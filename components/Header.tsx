/**
 * @fileoverview Компонент шапки сайта
 * Содержит логотип, навигацию и меню пользователя
 */

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, useCallback } from 'react';
import styles from '@/styles/Header.module.css';
import { AuthUser } from '@/types/auth';

/**
 * Props компонента Header
 */
interface HeaderProps {
  /** Callback открытия модального окна авторизации */
  onLoginClick?: () => void;
  /** Callback выхода из аккаунта */
  onLogout?: () => void;
  /** Текущий пользователь */
  user?: AuthUser | null;
}

/**
 * Шапка сайта
 * Отображает логотип и меню пользователя/кнопку входа
 *
 * @example
 * <Header
 *   user={currentUser}
 *   onLoginClick={() => setShowAuth(true)}
 *   onLogout={handleLogout}
 * />
 */
const Header: React.FC<HeaderProps> = ({ onLoginClick, onLogout, user }) => {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Закрытие меню при клике вне его области
   */
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  /**
   * Закрытие меню при изменении пользователя
   */
  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  /**
   * Переход в профиль
   */
  const handleProfileClick = useCallback(() => {
    setMenuOpen(false);
    router.push('/profile');
  }, [router]);

  /**
   * Выход из аккаунта
   */
  const handleLogoutClick = useCallback(() => {
    setMenuOpen(false);
    onLogout?.();
  }, [onLogout]);

  /**
   * Переключение меню
   */
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  /**
   * Обработчик клика мыши - убирает фокус для предотвращения обводки
   */
  const handleButtonClick = useCallback(() => {
    toggleMenu();
    // Убираем фокус после клика мыши, чтобы не было обводки
    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }, 0);
  }, [toggleMenu]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <Link href="/" className={styles.logo}>
          <img src="/img/icon/logo.svg" alt="SkyFitnessPro" className={styles.logoImage} />
          <div className={styles.logoSubtext}>Онлайн-тренировки для занятий дома</div>
        </Link>

        {/* Навигация */}
        <nav className={styles.nav}>
          {user ? (
            /* Меню авторизованного пользователя */
            <div className={styles.userMenuWrapper} ref={menuRef}>
              <button
                ref={buttonRef}
                type="button"
                className={`${styles.userProfileButton} ${
                  isMenuOpen ? styles.userProfileButtonActive : ''
                }`}
                onClick={handleButtonClick}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                {/* Аватар */}
                <span className={styles.userAvatar} aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5Z" />
                  </svg>
                </span>

                {/* Имя пользователя */}
                <span className={styles.userName}>{user.name}</span>

                {/* Стрелка */}
                <span
                  className={`${styles.userCaret} ${isMenuOpen ? styles.userCaretOpen : ''}`}
                  aria-hidden="true"
                >
                  <Image src="/img/icon/arrow.svg" alt="" width={13} height={8} />
                </span>
              </button>

              {/* Выпадающее меню */}
              {isMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownInfo}>
                    <span className={styles.userDropdownName}>{user.name}</span>
                    <span className={styles.userDropdownEmail}>{user.email}</span>
                  </div>
                  <div className={styles.userDropdownActions}>
                    <button
                      type="button"
                      className={styles.userDropdownPrimary}
                      onClick={handleProfileClick}
                    >
                      Мой профиль
                    </button>
                    <button
                      type="button"
                      className={styles.userDropdownSecondary}
                      onClick={handleLogoutClick}
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Кнопка входа для неавторизованных */
            <button className={styles.loginButton} onClick={onLoginClick}>
              Войти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
