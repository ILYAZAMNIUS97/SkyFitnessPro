import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ICourse } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import styles from '@/styles/CoursePage.module.css';

interface CoursePageProps {
  course: ICourse | null;
}

export default function CoursePage({ course }: CoursePageProps) {
  const router = useRouter();

  if (!course) {
    return (
      <Layout>
        <Head>
          <title>Курс не найден - SkyFitnessPro</title>
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
        <title>{course.title} - SkyFitnessPro</title>
        <meta name="description" content={course.description} />
      </Head>

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroImage}>
            <img src={course.image} alt={course.title} />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.description}>{course.description}</p>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Длительность:</span>
                <span className={styles.metaValue}>
                  {course.duration} {course.duration === 1 ? 'день' : 'дней'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Уровень:</span>
                <span className={styles.metaValue}>{course.difficulty}</span>
              </div>
            </div>
            <button className={styles.startButton}>Начать курс</button>
          </div>
        </div>

        <section className={styles.workoutsSection}>
          <h2 className={styles.sectionTitle}>Тренировки</h2>
          {course.workouts.length === 0 ? (
            <p className={styles.emptyText}>
              Тренировки для этого курса еще не добавлены. Скоро они появятся!
            </p>
          ) : (
            <div className={styles.workoutsList}>
              {/* Здесь будет список тренировок */}
              <p className={styles.emptyText}>Тренировки будут отображаться здесь</p>
            </div>
          )}
        </section>
      </div>
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
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      workouts: course.workouts.map((id) => id.toString()),
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

