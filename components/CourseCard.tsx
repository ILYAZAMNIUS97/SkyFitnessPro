import { ICourse } from '@/types/course';
import styles from '@/styles/CourseCard.module.css';
import Link from 'next/link';

interface CourseCardProps {
  course: ICourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Добавить логику подписки на курс
    console.log('Добавить курс:', course._id);
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
        <button className={styles.addButton} onClick={handleAddClick} aria-label="Добавить курс">
          +
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
  );
};

export default CourseCard;
