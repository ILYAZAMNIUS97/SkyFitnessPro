import { ReactNode } from 'react';
import Header from './Header';
import ScrollToTop from './ScrollToTop';
import styles from '@/styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <ScrollToTop />
    </div>
  );
};

export default Layout;

