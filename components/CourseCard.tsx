import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ICourse } from '@/types/course';
import styles from '@/styles/CourseCard.module.css';
import Link from 'next/link';
import AuthModal from './AuthModal';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';

interface CourseCardProps {
  course: ICourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCourse, setHasCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const user = localStorage.getItem(STORAGE_USER_KEY);

    if (token && user) {
      setIsAuthenticated(true);
      checkUserCourse();
    }
  }, []);

  const checkUserCourse = async () => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (!token) return;

      const response = await fetch('/api/user/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hasThisCourse = data.courses?.includes(course._id);
        setHasCourse(hasThisCourse);
      }
    } catch (error) {
      console.error('Error checking user courses:', error);
    }
  };

  const handleAddClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (hasCourse) {
      // Если курс уже добавлен, переходим в профиль
      router.push('/profile');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY);
      const response = await fetch('/api/user/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id }),
      });

      if (response.ok) {
        setHasCourse(true);
        router.push('/profile');
      } else {
        const data = await response.json();
        alert(data.message || 'Ошибка при добавлении курса');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Произошла ошибка при добавлении курса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsAuthenticated(true);
    checkUserCourse();
  };

  return (
    <>
      <div className={styles.card}>
        <div
          className={styles.imageWrapper}
          style={{ backgroundColor: course.backgroundColor || '#FFC700' }}
        >
          <Link href={`/course/${course._id}`}>
            <img src={course.image} alt={course.nameRU} className={styles.image} />
          </Link>
          <button
            className={`${styles.addButton} ${hasCourse ? styles.addButtonAdded : ''}`}
            onClick={handleAddClick}
            aria-label={hasCourse ? 'Курс добавлен' : 'Добавить курс'}
            disabled={isLoading}
          >
            {hasCourse ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <img src="/img/icon/plus.svg" alt="+" />
            )}
          </button>
        </div>
        <div className={styles.content}>
          <Link href={`/course/${course._id}`}>
            <h3 className={styles.title}>{course.nameRU}</h3>
          </Link>
          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <img src="/img/icon/Calendar.svg" alt="" className={styles.metaIcon} />
                <span>{course.durationInDays} дней</span>
              </div>
              <div className={styles.metaItem}>
                <img src="/img/icon/time.svg" alt="" className={styles.metaIcon} />
                <span>
                  {course.dailyDurationInMinutes.from}-{course.dailyDurationInMinutes.to} мин/день
                </span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <img src="/img/icon/mingcute_signal-fill.svg" alt="" className={styles.metaIcon} />
              <span>Сложность</span>
            </div>
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      )}
    </>
  );
};

export default CourseCard;
