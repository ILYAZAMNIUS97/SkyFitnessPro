import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import CourseCard from '@/components/CourseCard';
import { ICourse } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import styles from '@/styles/Home.module.css';

interface HomeProps {
  courses: ICourse[];
}

export default function Home({ courses }: HomeProps) {
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
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Начните заниматься спортом и улучшите качество жизни</h1>
          </div>
          <div className={styles.heroCallout}>Измени своё тело за полгода!</div>
        </section>

        <section className={styles.courses}>
          {courses.length === 0 ? (
            <div className={styles.empty}>
              <p>Курсы пока не добавлены. Скоро здесь появятся новые программы тренировок!</p>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

    // Преобразуем MongoDB объекты в простые объекты для сериализации
    const serializedCourses = courses.map((course: any) => ({
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt?.toISOString(),
      updatedAt: course.updatedAt?.toISOString(),
      workouts: course.workouts.map((id: any) => id.toString()),
    }));

    return {
      props: {
        courses: serializedCourses,
      },
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      props: {
        courses: [],
      },
    };
  }
};
