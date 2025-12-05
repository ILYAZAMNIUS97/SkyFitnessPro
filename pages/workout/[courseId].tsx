/**
 * @fileoverview Страница тренировки
 * Отображает видео тренировки и список упражнений с прогрессом
 */

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import WorkoutSelectModal from '@/components/WorkoutSelectModal';
import ProgressModal from '@/components/ProgressModal';
import SuccessModal from '@/components/SuccessModal';
import { getStoredToken, getStoredUser } from '@/hooks/useAuth';
import {
  getYouTubeEmbedUrl,
  calculateProgress,
  serializeDocument,
  serializeDocuments,
} from '@/lib/utils';
import { ICourse, IWorkout, IUserProgress } from '@/types/course';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Workout from '@/models/Workout';
import styles from '@/styles/WorkoutPage.module.css';

/**
 * Структура прогресса упражнения
 */
interface ExerciseProgress {
  exerciseName: string;
  completed: number;
}

/**
 * Props страницы тренировки
 */
interface WorkoutPageProps {
  /** Данные курса (null если не найден) */
  course: ICourse | null;
  /** Список тренировок курса */
  workouts: IWorkout[];
  /** Сообщение об ошибке */
  errorMessage: string | null;
}

/**
 * Страница тренировки
 * Защищённая страница, требует авторизации
 */
export default function WorkoutPage({ course, workouts, errorMessage }: WorkoutPageProps) {
  const router = useRouter();

  // Состояние данных
  const [selectedWorkout, setSelectedWorkout] = useState<IWorkout | null>(null);
  const [userProgress, setUserProgress] = useState<IUserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(errorMessage);

  // Состояние модальных окон
  const [showWorkoutSelect, setShowWorkoutSelect] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Загрузка прогресса пользователя
   */
  const loadUserProgress = useCallback(async () => {
    if (!course) return;

    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);

      // Загружаем прогресс пользователя
      const progressResponse = await fetch(`/api/user/progress?courseId=${course._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progressData = await progressResponse.json();

      if (progressData.success) {
        setUserProgress(progressData.progress || []);
      }

      // Показываем модальное окно выбора тренировки если есть тренировки
      if (workouts.length > 0) {
        setShowWorkoutSelect(true);
      }
    } catch (err) {
      console.error('Ошибка загрузки прогресса:', err);
    } finally {
      setLoading(false);
    }
  }, [course, workouts.length, router]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  /**
   * Выбор тренировки
   */
  const handleWorkoutSelect = useCallback(
    (workoutId: string) => {
      const workout = workouts.find((w) => w._id === workoutId);
      if (workout) {
        setSelectedWorkout(workout);
      }
    },
    [workouts]
  );

  /**
   * Сохранение прогресса
   */
  const handleSaveProgress = useCallback(
    async (progress: ExerciseProgress[]) => {
      if (!selectedWorkout || !course) return;

      const token = getStoredToken();
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/user/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course._id,
            workoutId: selectedWorkout._id,
            completedExercises: progress,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Обновляем локальный прогресс
          setUserProgress((prev) => {
            const newProgress: IUserProgress = {
              courseId: course._id,
              workoutId: selectedWorkout._id,
              completedExercises: progress,
              completedAt: new Date(),
            };

            const existingIndex = prev.findIndex(
              (p) => p.courseId === course._id && p.workoutId === selectedWorkout._id
            );

            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = newProgress;
              return updated;
            }
            return [...prev, newProgress];
          });

          setShowProgressModal(false);
          setShowSuccessModal(true);
        }
      } catch (err) {
        console.error('Ошибка сохранения прогресса:', err);
      }
    },
    [selectedWorkout, course, router]
  );

  /**
   * Получение текущего прогресса для тренировки
   */
  const getCurrentProgress = useCallback((): ExerciseProgress[] => {
    if (!selectedWorkout) return [];
    const progress = userProgress.find((p) => p.workoutId === selectedWorkout._id);
    return progress?.completedExercises || [];
  }, [selectedWorkout, userProgress]);

  /**
   * Получение процента выполнения упражнения
   */
  const getExerciseProgress = useCallback(
    (exerciseName: string, targetQuantity: number): number => {
      const currentProgressData = getCurrentProgress();
      const exerciseProgress = currentProgressData.find((p) => p.exerciseName === exerciseName);
      if (!exerciseProgress || !targetQuantity) return 0;
      return calculateProgress(exerciseProgress.completed, targetQuantity);
    },
    [getCurrentProgress]
  );

  /**
   * Проверка наличия прогресса
   */
  const hasProgress = useCallback((): boolean => {
    if (!selectedWorkout) return false;
    return userProgress.some((p) => p.workoutId === selectedWorkout._id);
  }, [selectedWorkout, userProgress]);

  // Embed URL для видео
  const embedUrl = selectedWorkout?.videoUrl ? getYouTubeEmbedUrl(selectedWorkout.videoUrl) : null;

  // Состояние загрузки
  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Загрузка... - SkyFitnessPro</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка тренировки...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Состояние ошибки
  if (error || !course) {
    return (
      <Layout>
        <Head>
          <title>Ошибка - SkyFitnessPro</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>Ошибка</h1>
            <p>{error || 'Курс не найден'}</p>
            <button onClick={() => router.push('/profile')} className={styles.backButton}>
              Вернуться в профиль
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{course.nameRU} - Тренировка - SkyFitnessPro</title>
        <meta name="description" content={`Тренировка по курсу ${course.nameRU}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{course.nameRU}</h1>

        {/* Видео секция */}
        <div className={styles.videoSection}>
          <div className={styles.videoWrapper}>
            {embedUrl ? (
              <iframe
                className={styles.videoIframe}
                src={embedUrl}
                title={selectedWorkout?.title || 'Видео тренировки'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoPlaceholder} onClick={() => setShowWorkoutSelect(true)}>
                <img src={course.image} alt={course.nameRU} />
                <div className={styles.playButton}>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Секция упражнений */}
        {selectedWorkout && selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
          <div className={styles.exercisesSection}>
            <h2 className={styles.exercisesTitle}>Упражнения тренировки {selectedWorkout.order}</h2>

            <div className={styles.exercisesGrid}>
              {selectedWorkout.exercises.map((exercise) => {
                const progress = getExerciseProgress(exercise.name, exercise.quantity);
                return (
                  <div key={exercise.name} className={styles.exerciseItem}>
                    <span className={styles.exerciseName}>
                      {exercise.name} {progress}%
                    </span>
                    <div className={styles.exerciseProgress}>
                      <div
                        className={styles.exerciseProgressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className={styles.progressButton} onClick={() => setShowProgressModal(true)}>
              {hasProgress() ? 'Обновить свой прогресс' : 'Заполнить свой прогресс'}
            </button>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showWorkoutSelect && workouts.length > 0 && (
        <WorkoutSelectModal
          workouts={workouts}
          courseName={course.nameRU}
          selectedWorkoutId={selectedWorkout?._id || null}
          userProgress={userProgress}
          onSelect={handleWorkoutSelect}
          onClose={() => setShowWorkoutSelect(false)}
        />
      )}

      {showProgressModal && selectedWorkout && (
        <ProgressModal
          exercises={selectedWorkout.exercises}
          currentProgress={getCurrentProgress()}
          onSave={handleSaveProgress}
          onClose={() => setShowProgressModal(false)}
        />
      )}

      {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
    </Layout>
  );
}

/**
 * Серверная загрузка данных курса и тренировок
 */
export const getServerSideProps: GetServerSideProps<WorkoutPageProps> = async (context) => {
  const { courseId } = context.params as { courseId: string };

  try {
    await dbConnect();

    // Загружаем курс
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return {
        props: {
          course: null,
          workouts: [],
          errorMessage: 'Курс не найден',
        },
      };
    }

    // Загружаем тренировки курса
    const workouts = await Workout.find({ courseId }).sort({ order: 1 }).lean();

    // Проверяем наличие тренировок
    const errorMessage = workouts.length === 0 ? 'Для этого курса пока нет тренировок' : null;

    return {
      props: {
        course: serializeDocument<ICourse>(course as ICourse),
        workouts: serializeDocuments<IWorkout>(workouts as IWorkout[]),
        errorMessage,
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки данных тренировки:', error);
    return {
      props: {
        course: null,
        workouts: [],
        errorMessage: 'Не удалось загрузить данные тренировки',
      },
    };
  }
};
