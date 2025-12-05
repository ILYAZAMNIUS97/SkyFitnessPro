import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { UserCoursesProvider } from '@/hooks/UserCoursesProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserCoursesProvider>
      <Component {...pageProps} />
    </UserCoursesProvider>
  );
}
