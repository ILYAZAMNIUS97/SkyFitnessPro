/**
 * Скрипт для заполнения базы данных тестовыми данными
 * Запуск: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Импортируем модели
const CourseSchema = new mongoose.Schema({
  nameRU: String,
  nameEN: String,
  description: String,
  image: String,
  heroImage: String,
  directions: [String],
  fitting: [String],
  difficulty: String,
  durationInDays: Number,
  dailyDurationInMinutes: {
    from: Number,
    to: Number,
  },
  backgroundColor: String,
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const coursesData = [
  {
    nameRU: 'Йога',
    nameEN: 'Yoga',
    description: `проработка всех групп мышц
тренировка суставов
улучшение циркуляции крови
упражнения заряжают бодростью
помогают противостоять стрессам`,
    image: '/img/1.jpg',
    heroImage: '/img/skill-card-1.png',
    directions: [
      'Йога для новичков',
      'Кундалини-йога',
      'Хатха-йога',
      'Классическая йога',
      'Йогатерапия',
      'Аштанга-йога',
    ],
    fitting: [
      'Давно хотели\nпопробовать йогу,\nно не решались начать',
      'Хотите укрепить\nпозвоночник, избавиться\nот болей в спине и суставах',
      'Ищете активность,\nполезную для тела\nи души',
    ],
    difficulty: 'Начальный',
    durationInDays: 25,
    dailyDurationInMinutes: {
      from: 20,
      to: 50,
    },
    backgroundColor: '#FFC700',
    workouts: [],
  },
  {
    nameRU: 'Стретчинг',
    nameEN: 'Stretching',
    description:
      'Комплексные упражнения на растяжку для развития гибкости и улучшения подвижности суставов. Профилактика травм и улучшение осанки. Подходит для всех уровней подготовки.',
    image: '/img/2.jpg',
    heroImage: '/img/skill-card-2.png',
    directions: ['Для новичков', 'Гибкость', 'Восстановление'],
    fitting: ['Все уровни', 'Растяжка', 'Восстановление'],
    difficulty: 'Начальный',
    durationInDays: 25,
    dailyDurationInMinutes: {
      from: 20,
      to: 50,
    },
    backgroundColor: '#2EA5FC',
    workouts: [],
  },
  {
    nameRU: 'Фитнес',
    nameEN: 'Fitness',
    description:
      'Силовые и кардио тренировки для создания подтянутого тела. Комплексный подход к жиросжиганию и набору мышечной массы. Интенсивные упражнения для опытных спортсменов.',
    image: '/img/3.jpg',
    heroImage: '/img/skill-card-3.png',
    directions: ['Силовые', 'Кардио', 'Похудение', 'Женщинам'],
    fitting: ['Средний уровень', 'Тонус', 'Энергия'],
    difficulty: 'Средний',
    durationInDays: 25,
    dailyDurationInMinutes: {
      from: 20,
      to: 50,
    },
    backgroundColor: '#FF6D00',
    workouts: [],
  },
  {
    nameRU: 'Степ-аэробика',
    nameEN: 'Step Aerobics',
    description:
      'Динамичные кардио тренировки с использованием степ-платформы. Эффективное жиросжигание, развитие координации и выносливости. Заряд энергии и бодрости на весь день.',
    image: '/img/4.jpg',
    heroImage: '/img/skill-card-4.png',
    directions: ['Кардио', 'Похудение', 'Координация', 'Выносливость'],
    fitting: ['Средний уровень', 'Активность', 'Энергия'],
    difficulty: 'Средний',
    durationInDays: 25,
    dailyDurationInMinutes: {
      from: 20,
      to: 50,
    },
    backgroundColor: '#FF6A5A',
    workouts: [],
  },
  {
    nameRU: 'Бодифлекс',
    nameEN: 'Bodyflex',
    description:
      'Уникальная методика дыхательной гимнастики для глубокой проработки мышц и похудения. Сочетание правильного дыхания со статическими упражнениями. Для продвинутого уровня.',
    image: '/img/5.jpg',
    heroImage: '/img/skill-card-5.png',
    directions: ['Для продвинутых', 'Дыхание', 'Похудение', 'Тонус'],
    fitting: ['Продвинутые', 'Специальная техника', 'Глубокая проработка'],
    difficulty: 'Продвинутый',
    durationInDays: 25,
    dailyDurationInMinutes: {
      from: 20,
      to: 50,
    },
    backgroundColor: '#9A48F1',
    workouts: [],
  },
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skyfitnesspro';

    console.log('🔌 Подключение к MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB успешно установлено');

    // Очищаем существующие данные
    console.log('🗑️  Очистка существующих данных...');
    await Course.deleteMany({});
    console.log('✅ Данные очищены');

    // Добавляем тестовые курсы
    console.log('📝 Добавление тестовых курсов...');
    const courses = await Course.insertMany(coursesData);
    console.log(`✅ Добавлено ${courses.length} курсов`);

    console.log('\n🎉 База данных успешно заполнена!');
    console.log('\nСозданные курсы:');
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.nameRU} (${course.difficulty})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
}

seed();
