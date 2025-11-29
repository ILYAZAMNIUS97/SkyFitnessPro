import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProfileCourseCard from '@/components/ProfileCourseCard';
import styles from '@/styles/Profile.module.css';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';
import { AuthUser } from '@/types/auth';
import { ICourse } from '@/types/course';

interface CourseWithProgress extends ICourse {
  progress: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных профиля
  const loadProfileData = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!token) {
      console.log('No token found, redirecting to home');
      router.push('/');
      return;
    }

    try {
      console.log('Fetching profile data...');
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Profile response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Токен невалиден, перенаправляем на главную
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          router.push('/');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile API error:', errorData);
        throw new Error(errorData.message || 'Ошибка загрузки профиля');
      }

      const data = await response.json();
      console.log('Profile data loaded:', data);
      setUser(data.user);
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Проверяем авторизацию
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (!storedUser) {
      router.push('/');
      return;
    }

    loadProfileData();
  }, [loadProfileData, router]);

  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    router.push('/');
  };

  // Удаление курса
  const handleRemoveCourse = async (courseId: string) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!token) return;

    try {
      const response = await fetch('/api/user/courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      console.error('Error removing course:', err);
    }
  };

  // Переход к тренировке
  const handleStartWorkout = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  // Состояние загрузки
  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Профиль - SkyFitnessPro</title>
          <meta name="description" content="Личный кабинет пользователя" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
          />
        </Head>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <Layout>
        <Head>
          <title>Профиль - SkyFitnessPro</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => router.push('/')} className={styles.backButton}>
              На главную
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Профиль - SkyFitnessPro</title>
        <meta name="description" content="Личный кабинет пользователя" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Профиль</h1>

        {/* Карточка профиля */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="#F2F2F2" />
              <path
                d="M50 55C58.2843 55 65 48.2843 65 40C65 31.7157 58.2843 25 50 25C41.7157 25 35 31.7157 35 40C35 48.2843 41.7157 55 50 55Z"
                fill="#D9D9D9"
              />
              <path
                d="M50 60C33.4315 60 20 68.9543 20 80V85C20 87.7614 22.2386 90 25 90H75C77.7614 90 80 87.7614 80 85V80C80 68.9543 66.5685 60 50 60Z"
                fill="#D9D9D9"
              />
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.userName}>{user?.name}</h2>
            <p className={styles.userLogin}>Логин: {user?.email?.split('@')[0]}</p>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        {/* Секция курсов */}
        <section className={styles.coursesSection}>
          <h2 className={styles.sectionTitle}>Мои курсы</h2>

          {courses.length === 0 ? (
            <div className={styles.noCourses}>
              <p>У вас пока нет добавленных курсов</p>
              <button onClick={() => router.push('/')} className={styles.addCourseButton}>
                Выбрать курс
              </button>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <ProfileCourseCard
                  key={course._id}
                  course={course}
                  progress={course.progress}
                  onRemove={handleRemoveCourse}
                  onStartWorkout={handleStartWorkout}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
