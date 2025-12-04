/**
 * @fileoverview Страница отдельного курса
 * Отображает подробную информацию о курсе и позволяет добавить его
 */

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import AuthModal from '@/components/AuthModal';
import SuccessModal from '@/components/SuccessModal';
import { getStoredToken, getStoredUser } from '@/hooks/useAuth';
import { serializeDocument } from '@/lib/utils';
import { ICourse } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import styles from '@/styles/CoursePage.module.css';

/**
 * Props страницы курса
 */
interface CoursePageProps {
  /** Данные курса (null если не найден) */
  course: ICourse | null;
}

/**
 * Страница курса
 * Отображает описание курса, направления и CTA-секцию
 */
export default function CoursePage({ course }: CoursePageProps) {
  const router = useRouter();

  // Состояние компонента
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCourse, setHasCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Проверяет, добавлен ли курс у пользователя
   */
  const checkUserCourse = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !course) return;

    try {
      const response = await fetch('/api/user/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHasCourse(data.courses?.includes(course._id) ?? false);
      }
    } catch (error) {
      console.error('Ошибка проверки курсов:', error);
    }
  }, [course]);

  /**
   * Проверка авторизации при монтировании
   */
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user) {
      setIsAuthenticated(true);
      checkUserCourse();
    }
  }, [checkUserCourse]);

  /**
   * Обработчик добавления курса
   */
  const handleAddCourse = useCallback(async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (hasCourse) {
      router.push('/profile');
      return;
    }

    setIsLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch('/api/user/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course?._id }),
      });

      if (response.ok) {
        setHasCourse(true);
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Ошибка при добавлении курса');
      }
    } catch (error) {
      console.error('Ошибка добавления курса:', error);
      alert('Произошла ошибка при добавлении курса');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, hasCourse, course, router]);

  /**
   * Обработчик успешной авторизации
   */
  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    setIsAuthenticated(true);
    checkUserCourse();
  }, [checkUserCourse]);

  /**
   * Получение текста кнопки
   */
  const getButtonText = (): string => {
    if (hasCourse) return 'Перейти к тренировкам';
    if (!isAuthenticated) return 'Войдите, чтобы добавить курс';
    return 'Добавить курс';
  };

  // Курс не найден
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

  return (
    <Layout>
      <Head>
        <title>{course.nameRU} - SkyFitnessPro</title>
        <meta name="description" content={course.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className={styles.container}>
        {/* Hero Banner */}
        <div className={styles.hero}>
          <img
            src={course.heroImage || course.image}
            alt={course.nameRU}
            className={styles.heroImageDesktop}
          />
          <img src={course.image} alt={course.nameRU} className={styles.heroImageMobile} />
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
                  <img src="/img/icon/star.svg" alt="" className={styles.directionIcon} />
                  <span className={styles.directionText}>{direction}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Бегун для мобильной версии */}
        <div className={styles.mobileRunnerSection}>
          <img src="/img/vector-6084.png" alt="" className={styles.mobileVectorBack} />
          <img src="/img/vector-6094.png" alt="" className={styles.mobileVectorFront} />
          <img
            src="/img/runner.png"
            alt="Start your fitness journey"
            className={styles.mobileRunnerImage}
          />
        </div>

        {/* CTA секция */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaVectorContainer}>
            <img src="/img/vector-6084.png" alt="" className={styles.ctaVectorBack} />
          </div>
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
              <img src="/img/vector-6094.png" alt="" className={styles.ctaVectorFront} />
              <img
                src="/img/runner.png"
                alt="Start your fitness journey"
                className={styles.runnerImage}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Модальное окно авторизации */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      )}

      {/* Модальное окно успешного добавления курса */}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} title="Курс добавлен!" />
      )}
    </Layout>
  );
}

/**
 * Серверная загрузка данных курса
 */
export const getServerSideProps: GetServerSideProps<CoursePageProps> = async (context) => {
  const { id } = context.params as { id: string };

  try {
    await dbConnect();
    const course = await Course.findById(id).lean();

    if (!course) {
      return { props: { course: null } };
    }

    return {
      props: {
        course: serializeDocument<ICourse>(course as ICourse),
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки курса:', error);
    return { props: { course: null } };
  }
};
