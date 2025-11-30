import { ICourse } from '@/types/course';
import styles from '@/styles/ProfileCourseCard.module.css';
import Link from 'next/link';

interface ProfileCourseCardProps {
  course: ICourse;
  progress: number; // 0-100
  onRemove?: (courseId: string) => void;
  onStartWorkout?: (courseId: string) => void;
}

const ProfileCourseCard: React.FC<ProfileCourseCardProps> = ({
  course,
  progress,
  onRemove,
  onStartWorkout,
}) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(course._id);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onStartWorkout?.(course._id);
  };

  // Определяем текст кнопки в зависимости от прогресса
  const getButtonText = () => {
    if (progress === 0) return 'Начать тренировки';
    if (progress >= 100) return 'Начать заново';
    return 'Продолжить';
  };

  return (
    <div className={styles.card}>
      <div
        className={styles.imageWrapper}
        style={{ backgroundColor: course.backgroundColor || '#FFC700' }}
      >
        <Link href={`/course/${course._id}`}>
          <img src={course.image} alt={course.nameRU} className={styles.image} />
        </Link>
        <button
          className={styles.removeButton}
          onClick={handleRemoveClick}
          aria-label="Удалить курс"
          title="Удалить курс"
        >
          <svg
            width="14"
            height="4"
            viewBox="0 0 14 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 2H14" stroke="white" strokeWidth="3" />
          </svg>
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
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>Прогресс {progress}%</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className={styles.actionButton} onClick={handleButtonClick}>
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default ProfileCourseCard;

