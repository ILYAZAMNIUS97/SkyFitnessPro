/**
 * Скрипт для заполнения базы данных тестовыми данными
 * Запуск: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Схемы
const ExerciseSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
});

const WorkoutSchema = new mongoose.Schema({
  courseId: String,
  title: String,
  description: String,
  videoUrl: String,
  exercises: [ExerciseSchema],
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

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
const Workout = mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);

// Данные тренировок для каждого курса
// Используем реальные YouTube видео с йогой и фитнесом
const workoutsTemplates = {
  yoga: [
    {
      title: 'Утренняя практика',
      description: 'Пробуждающий комплекс йоги для начала дня',
      videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
      exercises: [
        { name: 'Наклоны вперед', quantity: 50, unit: 'повторения' },
        { name: 'Наклоны назад', quantity: 50, unit: 'повторения' },
        { name: 'Поднятие ног, согнутых в коленях', quantity: 50, unit: 'повторения' },
      ],
      order: 1,
    },
    {
      title: 'Красота и здоровье',
      description: 'Комплекс для улучшения осанки и гибкости',
      videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
      exercises: [
        { name: 'Наклоны вперед', quantity: 50, unit: 'повторения' },
        { name: 'Наклоны назад', quantity: 50, unit: 'повторения' },
        { name: 'Поднятие ног, согнутых в коленях', quantity: 50, unit: 'повторения' },
      ],
      order: 2,
    },
    {
      title: 'Асаны стоя',
      description: 'Базовые позы йоги в положении стоя',
      videoUrl: 'https://www.youtube.com/watch?v=j7rKKpwdXNE',
      exercises: [
        { name: 'Наклоны вперед', quantity: 50, unit: 'повторения' },
        { name: 'Наклоны назад', quantity: 50, unit: 'повторения' },
        { name: 'Поднятие ног, согнутых в коленях', quantity: 50, unit: 'повторения' },
      ],
      order: 3,
    },
    {
      title: 'Растягиваем мышцы бедра',
      description: 'Глубокая растяжка бедер и тазобедренных суставов',
      videoUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
      exercises: [
        { name: 'Наклоны вперед', quantity: 50, unit: 'повторения' },
        { name: 'Наклоны назад', quantity: 50, unit: 'повторения' },
        { name: 'Поднятие ног, согнутых в коленях', quantity: 50, unit: 'повторения' },
      ],
      order: 4,
    },
    {
      title: 'Гибкость спины',
      description: 'Упражнения для здоровья позвоночника',
      videoUrl: 'https://www.youtube.com/watch?v=COp7BR_Dvps',
      exercises: [
        { name: 'Наклоны вперед', quantity: 50, unit: 'повторения' },
        { name: 'Наклоны назад', quantity: 50, unit: 'повторения' },
        { name: 'Поднятие ног, согнутых в коленях', quantity: 50, unit: 'повторения' },
      ],
      order: 5,
    },
  ],
  stretching: [
    {
      title: 'Утренняя растяжка',
      description: 'Мягкая растяжка для пробуждения тела',
      videoUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
      exercises: [
        { name: 'Растяжка спины', quantity: 30, unit: 'повторения' },
        { name: 'Растяжка ног', quantity: 30, unit: 'повторения' },
        { name: 'Растяжка рук', quantity: 30, unit: 'повторения' },
      ],
      order: 1,
    },
    {
      title: 'Глубокий стретчинг',
      description: 'Интенсивная растяжка всего тела',
      videoUrl: 'https://www.youtube.com/watch?v=qULTwquOuT4',
      exercises: [
        { name: 'Растяжка спины', quantity: 40, unit: 'повторения' },
        { name: 'Растяжка ног', quantity: 40, unit: 'повторения' },
        { name: 'Растяжка рук', quantity: 40, unit: 'повторения' },
      ],
      order: 2,
    },
    {
      title: 'Шпагат',
      description: 'Подготовка к продольному и поперечному шпагату',
      videoUrl: 'https://www.youtube.com/watch?v=L_xrDAtykMI',
      exercises: [
        { name: 'Выпады', quantity: 20, unit: 'повторения' },
        { name: 'Складка', quantity: 30, unit: 'секунды' },
        { name: 'Бабочка', quantity: 30, unit: 'секунды' },
      ],
      order: 3,
    },
  ],
  fitness: [
    {
      title: 'Кардио разминка',
      description: 'Интенсивная кардио тренировка',
      videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
      exercises: [
        { name: 'Прыжки на месте', quantity: 50, unit: 'повторения' },
        { name: 'Бег на месте', quantity: 60, unit: 'секунды' },
        { name: 'Берпи', quantity: 20, unit: 'повторения' },
      ],
      order: 1,
    },
    {
      title: 'Силовая тренировка',
      description: 'Упражнения с собственным весом',
      videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
      exercises: [
        { name: 'Приседания', quantity: 30, unit: 'повторения' },
        { name: 'Отжимания', quantity: 20, unit: 'повторения' },
        { name: 'Планка', quantity: 60, unit: 'секунды' },
      ],
      order: 2,
    },
    {
      title: 'Пресс и кор',
      description: 'Укрепление мышц пресса и кора',
      videoUrl: 'https://www.youtube.com/watch?v=AnYl6Nk9GOA',
      exercises: [
        { name: 'Скручивания', quantity: 30, unit: 'повторения' },
        { name: 'Велосипед', quantity: 30, unit: 'повторения' },
        { name: 'Подъем ног', quantity: 20, unit: 'повторения' },
      ],
      order: 3,
    },
  ],
  stepAerobics: [
    {
      title: 'Базовые шаги',
      description: 'Изучение базовых шагов степ-аэробики',
      videoUrl: 'https://www.youtube.com/watch?v=hLTJD9_DP6k',
      exercises: [
        { name: 'Basic Step', quantity: 50, unit: 'повторения' },
        { name: 'V-Step', quantity: 40, unit: 'повторения' },
        { name: 'Knee Lift', quantity: 30, unit: 'повторения' },
      ],
      order: 1,
    },
    {
      title: 'Интервальный степ',
      description: 'Чередование высокой и низкой интенсивности',
      videoUrl: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      exercises: [
        { name: 'Over the Top', quantity: 30, unit: 'повторения' },
        { name: 'Turn Step', quantity: 20, unit: 'повторения' },
        { name: 'Repeater', quantity: 40, unit: 'повторения' },
      ],
      order: 2,
    },
  ],
  bodyflex: [
    {
      title: 'Дыхательная гимнастика',
      description: 'Основы диафрагмального дыхания',
      videoUrl: 'https://www.youtube.com/watch?v=Bys9R4EESHg',
      exercises: [
        { name: 'Диафрагмальное дыхание', quantity: 10, unit: 'минуты' },
        { name: 'Задержка дыхания', quantity: 5, unit: 'повторения' },
        { name: 'Вакуум живота', quantity: 5, unit: 'повторения' },
      ],
      order: 1,
    },
    {
      title: 'Бодифлекс для живота',
      description: 'Упражнения для плоского живота',
      videoUrl: 'https://www.youtube.com/watch?v=eMoLMBvPkrs',
      exercises: [
        { name: 'Боковая растяжка', quantity: 10, unit: 'повторения' },
        { name: 'Алмаз', quantity: 10, unit: 'повторения' },
        { name: 'Лев', quantity: 10, unit: 'повторения' },
      ],
      order: 2,
    },
  ],
};

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
    workoutsKey: 'yoga' as const,
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
    workoutsKey: 'stretching' as const,
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
    workoutsKey: 'fitness' as const,
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
    workoutsKey: 'stepAerobics' as const,
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
    workoutsKey: 'bodyflex' as const,
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
    await Workout.deleteMany({});
    console.log('✅ Данные очищены');

    // Добавляем курсы с тренировками
    console.log('📝 Добавление курсов и тренировок...');

    for (const courseData of coursesData) {
      const { workoutsKey, ...courseFields } = courseData;

      // Создаем курс
      const course = await Course.create({
        ...courseFields,
        workouts: [],
      });

      console.log(`  📚 Создан курс: ${course.nameRU}`);

      // Создаем тренировки для курса
      const workoutTemplates = workoutsTemplates[workoutsKey] || [];
      const workoutIds = [];

      for (const workoutTemplate of workoutTemplates) {
        const courseIdString = course._id.toString();
        console.log(
          `    📝 Создание тренировки для courseId: ${courseIdString} (type: ${typeof courseIdString})`
        );

        const workout = await Workout.create({
          ...workoutTemplate,
          courseId: courseIdString,
        });

        console.log(
          `    🏋️ Создана тренировка: ${workout.title} (ID: ${workout._id}, courseId: ${workout.courseId}, courseId type: ${typeof workout.courseId})`
        );
        workoutIds.push(workout._id);
      }

      // Обновляем курс с ID тренировок
      await Course.findByIdAndUpdate(course._id, { workouts: workoutIds });
    }

    const courses = await Course.find({});
    const workouts = await Workout.find({});

    console.log(`\n✅ Добавлено ${courses.length} курсов`);
    console.log(`✅ Добавлено ${workouts.length} тренировок`);

    console.log('\n🎉 База данных успешно заполнена!');
    console.log('\nСозданные курсы:');
    for (const course of courses) {
      const courseIdString = course._id.toString();
      const courseWorkouts = workouts.filter((w) => w.courseId === courseIdString);
      console.log(
        `  ${course.nameRU} (${course.difficulty}) - ${courseWorkouts.length} тренировок`
      );
      console.log(`    Course ID: ${courseIdString}`);
      if (courseWorkouts.length > 0) {
        console.log(
          `    First workout courseId: ${courseWorkouts[0].courseId} (type: ${typeof courseWorkouts[0].courseId})`
        );
      } else {
        console.log(`    ⚠️  Нет тренировок для этого курса!`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
}

seed();
