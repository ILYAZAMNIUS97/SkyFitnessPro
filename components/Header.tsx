import Link from 'next/link';
import styles from '@/styles/Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/img/icon/logo.svg" alt="SkyFitnessPro" className={styles.logoImage} />
          <div className={styles.logoSubtext}>Онлайн-тренировки для занятий дома</div>
        </Link>
        <nav className={styles.nav}>
          <button className={styles.loginButton}>Войти</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
