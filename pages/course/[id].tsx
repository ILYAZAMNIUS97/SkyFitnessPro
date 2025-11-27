import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthModal from '@/components/AuthModal';
import { ICourse } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import styles from '@/styles/CoursePage.module.css';

interface CoursePageProps {
  course: ICourse | null;
}

export default function CoursePage({ course }: CoursePageProps) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasCourse, setHasCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');

    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      checkUserCourse(email);
    }
  }, [course]);

  const checkUserCourse = async (email: string) => {
    try {
      const response = await fetch('/api/user/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hasThisCourse = data.courses?.includes(course?._id);
        setHasCourse(hasThisCourse);
      }
    } catch (error) {
      console.error('Error checking user courses:', error);
    }
  };

  const handleAddCourse = async () => {
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
      const response = await fetch('/api/user/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ courseId: course?._id }),
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
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');

    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      checkUserCourse(email);
    }
  };

  if (!course) {
    return (
      <Layout>
        <Head>
          <title>Курс не найден - SkyFitnessPro</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
          />
        </Head>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>Курс не найден</h1>
            <p>К сожалению, запрашиваемый курс не существует.</p>
            <button onClick={() => router.push('/')} className={styles.backButton}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getButtonText = () => {
    if (!isAuthenticated) return 'Войдите, чтобы добавить курс';
    if (hasCourse) return 'Перейти к тренировкам';
    return 'Добавить курс';
  };

  return (
    <Layout>
      <Head>
        <title>{course.nameRU} - SkyFitnessPro</title>
        <meta name="description" content={course.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className={styles.container}>
        {/* Hero Banner */}
        <div
          className={styles.hero}
          style={{ backgroundColor: course.backgroundColor || '#FFC700' }}
        >
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{course.nameRU}</h1>
          </div>
          <div className={styles.heroImage}>
            <img src={course.image} alt={course.nameRU} />
          </div>
        </div>

        {/* Подойдет для вас */}
        {course.fitting && course.fitting.length > 0 && (
          <section className={styles.fittingSection}>
            <h2 className={styles.sectionTitle}>Подойдет для вас, если:</h2>
            <div className={styles.fittingCards}>
              {course.fitting.map((item, index) => (
                <div key={index} className={styles.fittingCard}>
                  <span className={styles.fittingNumber}>{index + 1}</span>
                  <p className={styles.fittingText}>{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Направления */}
        {course.directions && course.directions.length > 0 && (
          <section className={styles.directionsSection}>
            <h2 className={styles.sectionTitle}>Направления</h2>
            <div className={styles.directionsGrid}>
              {course.directions.map((direction, index) => (
                <div key={index} className={styles.directionItem}>
                  <span className={styles.directionPlus}>+</span>
                  <span className={styles.directionText}>{direction}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Начните путь к новому телу */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Начните путь
              <br />к новому телу
            </h2>
            {course.description && (
              <ul className={styles.benefitsList}>
                {course.description
                  .split('\n')
                  .filter((line) => line.trim())
                  .map((benefit, index) => (
                    <li key={index} className={styles.benefitItem}>
                      {benefit}
                    </li>
                  ))}
              </ul>
            )}
            <button className={styles.ctaButton} onClick={handleAddCourse} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : getButtonText()}
            </button>
          </div>
          <div className={styles.ctaImage}>
            <div className={styles.ctaImageWrapper}>
              {/* Декоративные круги */}
              <div className={styles.decorCircle1}></div>
              <div className={styles.decorCircle2}></div>
              <img
                src="/img/runner.png"
                alt="Start your fitness journey"
                className={styles.runnerImage}
              />
            </div>
          </div>
        </section>
      </div>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    await dbConnect();
    const course = await Course.findById(id).lean();

    if (!course) {
      return {
        props: {
          course: null,
        },
      };
    }

    // Преобразуем MongoDB объект в простой объект для сериализации
    const serializedCourse = {
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt?.toISOString(),
      updatedAt: course.updatedAt?.toISOString(),
      workouts: course.workouts.map((id: any) => id.toString()),
    };

    return {
      props: {
        course: serializedCourse,
      },
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return {
      props: {
        course: null,
      },
    };
  }
};
