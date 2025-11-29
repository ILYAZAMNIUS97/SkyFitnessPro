import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import WorkoutSelectModal from '@/components/WorkoutSelectModal';
import ProgressModal from '@/components/ProgressModal';
import SuccessModal from '@/components/SuccessModal';
import { ICourse, IWorkout, IUserProgress } from '@/types/course';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '@/lib/storageKeys';
import styles from '@/styles/WorkoutPage.module.css';

export default function WorkoutPage() {
  const router = useRouter();
  const { courseId } = router.query;

  // Состояния
  const [course, setCourse] = useState<ICourse | null>(null);
  const [workouts, setWorkouts] = useState<IWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<IWorkout | null>(null);
  const [userProgress, setUserProgress] = useState<IUserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальные окна
  const [showWorkoutSelect, setShowWorkoutSelect] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Загрузка данных курса и тренировок
  const loadData = useCallback(async () => {
    if (!courseId || typeof courseId !== 'string') return;

    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const user = localStorage.getItem(STORAGE_USER_KEY);

    if (!token || !user) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Загружаем курс
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseResponse.json();

      if (!courseData.success) {
        throw new Error('Курс не найден');
      }

      setCourse(courseData.data);

      // Загружаем тренировки
      console.log('=== Loading workouts ===');
      console.log('CourseId:', courseId);
      console.log('CourseId type:', typeof courseId);
      console.log('Fetching from:', `/api/workouts/${courseId}`);

      const workoutsResponse = await fetch(`/api/workouts/${courseId}`);
      console.log('Workouts response status:', workoutsResponse.status);

      const workoutsData = await workoutsResponse.json();
      console.log('Workouts response data:', workoutsData);

      if (workoutsData.success && Array.isArray(workoutsData.data)) {
        console.log('Workouts loaded successfully:', workoutsData.data.length);
        setWorkouts(workoutsData.data);
        // Показываем модальное окно выбора тренировки
        if (workoutsData.data.length > 0) {
          setShowWorkoutSelect(true);
        } else {
          setError('Для этого курса пока нет тренировок');
        }
      } else {
        console.error('Failed to load workouts:', workoutsData);
        setWorkouts([]);
        if (workoutsData.debug) {
          console.error('Debug info:', workoutsData.debug);
          if (workoutsData.debug.totalWorkoutsInDB === 0) {
            setError('В базе данных нет тренировок. Запустите seed-скрипт: npm run seed');
          } else {
            setError(
              'Тренировки для этого курса не найдены. Возможно, курс был удален или обновлен. Обновите страницу профиля.'
            );
          }
        } else {
          setError(workoutsData.error || 'Не удалось загрузить тренировки');
        }
      }

      // Загружаем прогресс пользователя
      const progressResponse = await fetch(`/api/user/progress?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const progressData = await progressResponse.json();

      if (progressData.success) {
        setUserProgress(progressData.progress || []);
      }
    } catch (err) {
      console.error('Error loading workout data:', err);
      setError('Не удалось загрузить данные тренировки');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Выбор тренировки
  const handleWorkoutSelect = (workoutId: string) => {
    console.log('=== Selecting workout ===');
    console.log('WorkoutId:', workoutId);
    console.log(
      'Available workouts:',
      workouts.map((w) => ({ _id: w._id, title: w.title }))
    );

    const workout = workouts.find((w) => w._id === workoutId);
    if (workout) {
      console.log('Workout found:', workout);
      console.log('Workout videoUrl:', workout.videoUrl);
      setSelectedWorkout(workout);
    } else {
      console.error('Workout not found!', workoutId);
    }
  };

  // Закрытие модального окна выбора тренировки
  const handleWorkoutSelectClose = () => {
    setShowWorkoutSelect(false);
  };

  // Открытие модального окна прогресса
  const handleOpenProgressModal = () => {
    setShowProgressModal(true);
  };

  // Сохранение прогресса
  const handleSaveProgress = async (progress: { exerciseName: string; completed: number }[]) => {
    if (!selectedWorkout || !courseId) return;

    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
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
          courseId,
          workoutId: selectedWorkout._id,
          completedExercises: progress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем локальный прогресс
        setUserProgress((prev) => {
          const existingIndex = prev.findIndex(
            (p) => p.courseId === courseId && p.workoutId === selectedWorkout._id
          );
          const newProgress = {
            courseId: courseId as string,
            workoutId: selectedWorkout._id,
            completedExercises: progress,
            completedAt: new Date(),
          };

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = newProgress;
            return updated;
          }
          return [...prev, newProgress];
        });

        // Закрываем модальное окно прогресса и показываем успех
        setShowProgressModal(false);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Получить текущий прогресс для тренировки
  const getCurrentProgress = () => {
    if (!selectedWorkout) return [];
    const progress = userProgress.find((p) => p.workoutId === selectedWorkout._id);
    return progress?.completedExercises || [];
  };

  // Получить процент выполнения упражнения
  const getExerciseProgress = (exerciseName: string, targetQuantity: number) => {
    const currentProgressData = getCurrentProgress();
    const exerciseProgress = currentProgressData.find((p) => p.exerciseName === exerciseName);
    if (!exerciseProgress || !targetQuantity) return 0;
    return Math.min(Math.round((exerciseProgress.completed / targetQuantity) * 100), 100);
  };

  // Проверить, есть ли прогресс у тренировки
  const hasProgress = () => {
    if (!selectedWorkout) return false;
    return userProgress.some((p) => p.workoutId === selectedWorkout._id);
  };

  // Преобразование YouTube URL в embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;

    // Форматы:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    let videoId = '';

    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

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

  const embedUrl = selectedWorkout?.videoUrl ? getYouTubeEmbedUrl(selectedWorkout.videoUrl) : null;

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

            <button className={styles.progressButton} onClick={handleOpenProgressModal}>
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
          onClose={handleWorkoutSelectClose}
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
