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
    description: `развитие гибкости тела
улучшение подвижности суставов
снятие мышечного напряжения
профилактика травм
улучшение осанки`,
    image: '/img/2.jpg',
    heroImage: '/img/skill-card-2.png',
    directions: [
      'Растяжка для начинающих',
      'Глубокий стретчинг',
      'Динамическая растяжка',
      'Статическая растяжка',
      'Растяжка для спины',
      'Шпагат за 30 дней',
    ],
    fitting: [
      'Хотите стать\nболее гибким\nи пластичным',
      'Чувствуете скованность\nв мышцах после\nрабочего дня',
      'Мечтаете сесть\nна шпагат\nи улучшить осанку',
    ],
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
    description: `сжигание лишнего жира
укрепление мышечного корсета
повышение выносливости
улучшение рельефа тела
заряд энергии на весь день`,
    image: '/img/3.jpg',
    heroImage: '/img/skill-card-3.png',
    directions: [
      'Силовые тренировки',
      'Кардио нагрузки',
      'Функциональный тренинг',
      'Круговые тренировки',
      'Жиросжигание',
      'Тренировки для женщин',
    ],
    fitting: [
      'Хотите похудеть\nи привести тело\nв отличную форму',
      'Стремитесь увеличить\nвыносливость и\nукрепить мышцы',
      'Ищете эффективные\nтренировки для\nдомашних условий',
    ],
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
    description: `эффективное жиросжигание
развитие координации движений
укрепление сердечно-сосудистой системы
повышение выносливости
улучшение настроения`,
    image: '/img/4.jpg',
    heroImage: '/img/skill-card-4.png',
    directions: [
      'Базовая степ-аэробика',
      'Интервальный степ',
      'Танцевальный степ',
      'Силовой степ',
      'Степ для начинающих',
      'Продвинутый уровень',
    ],
    fitting: [
      'Любите активные\nи динамичные\nтренировки',
      'Хотите улучшить\nкоординацию и\nчувство ритма',
      'Ищете весёлый способ\nсбросить лишние\nкилограммы',
    ],
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
    description: `глубокая проработка мышц
насыщение организма кислородом
ускорение метаболизма
уменьшение объёмов тела
снятие стресса и напряжения`,
    image: '/img/5.jpg',
    heroImage: '/img/skill-card-5.png',
    directions: [
      'Дыхательная гимнастика',
      'Бодифлекс для лица',
      'Бодифлекс для живота',
      'Утренний комплекс',
      'Вечерний комплекс',
      'Продвинутый уровень',
    ],
    fitting: [
      'Хотите похудеть\nбез изнурительных\nтренировок',
      'Ищете методику\nс акцентом на\nправильное дыхание',
      'Желаете улучшить\nсамочувствие и\nснять стресс',
    ],
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
