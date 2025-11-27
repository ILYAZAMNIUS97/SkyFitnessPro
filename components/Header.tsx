import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/Header.module.css';
import { AuthUser } from '@/types/auth';

interface HeaderProps {
  onLoginClick?: () => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onLogout, user }) => {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  const handleProfileClick = () => {
    setMenuOpen(false);
    router.push('/profile');
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/img/icon/logo.svg" alt="SkyFitnessPro" className={styles.logoImage} />
          <div className={styles.logoSubtext}>Онлайн-тренировки для занятий дома</div>
        </Link>
        <nav className={styles.nav}>
          {user ? (
            <div className={styles.userMenuWrapper} ref={menuRef}>
              <button
                type="button"
                className={`${styles.userProfileButton} ${isMenuOpen ? styles.userProfileButtonActive : ''}`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                <span className={styles.userAvatar} aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5Z" />
                  </svg>
                </span>
                <span className={styles.userName}>{user.name}</span>
                <span
                  className={`${styles.userCaret} ${isMenuOpen ? styles.userCaretOpen : ''}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownInfo}>
                    <span className={styles.userDropdownName}>{user.name}</span>
                    <span className={styles.userDropdownEmail}>{user.email}</span>
                  </div>
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
              )}
            </div>
          ) : (
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
