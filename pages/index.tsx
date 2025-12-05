/**
 * @fileoverview Главная страница приложения
 * Отображает список доступных курсов
 */

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import CourseCard from '@/components/CourseCard';
import { sortCoursesByOrder, serializeDocuments } from '@/lib/utils';
import { COURSES_DISPLAY_ORDER } from '@/lib/constants';
import { ICourse } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import styles from '@/styles/Home.module.css';

/**
 * Props главной страницы
 */
interface HomeProps {
  /** Список курсов */
  courses: ICourse[];
}

/**
 * Главная страница
 * Отображает hero-секцию и сетку карточек курсов
 */
export default function Home({ courses }: HomeProps) {
  // Сортируем курсы в заданном порядке
  const sortedCourses = sortCoursesByOrder(courses, COURSES_DISPLAY_ORDER);

  return (
    <Layout>
      <Head>
        <title>SkyFitnessPro - Домашние тренировки</title>
        <meta
          name="description"
          content="Приложение для домашних тренировок с личным кабинетом и отслеживанием прогресса"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Hero секция */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Начните заниматься спортом и улучшите качество жизни</h1>
          </div>
          <div className={styles.heroCallout}>Измени своё тело за полгода!</div>
        </section>

        {/* Секция курсов */}
        <section className={styles.courses}>
          {sortedCourses.length === 0 ? (
            <div className={styles.empty}>
              <p>Курсы пока не добавлены. Скоро здесь появятся новые программы тренировок!</p>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {sortedCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

/**
 * Серверная загрузка данных
 * Получает список курсов из базы данных
 */
export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

    return {
      props: {
        courses: serializeDocuments<ICourse>(courses as ICourse[]),
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    return {
      props: {
        courses: [],
      },
    };
  }
};
