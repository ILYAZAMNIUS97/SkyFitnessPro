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
  title: String,
  description: String,
  image: String,
  duration: Number,
  difficulty: String,
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const coursesData = [
  {
    title: 'Йога',
    description:
      'Освойте основы йоги с нашим курсом для новичков. Улучшите гибкость, силу и баланс.',
    image: '/img/1.jpg',
    duration: 25,
    difficulty: 'Начальный',
    backgroundColor: '#FFC700',
    workouts: [],
  },
  {
    title: 'Стретчинг',
    description:
      'Развитие гибкости и улучшение подвижности суставов. Подходит для всех уровней подготовки.',
    image: '/img/2.jpg',
    duration: 25,
    difficulty: 'Начальный',
    backgroundColor: '#2EA5FC',
    workouts: [],
  },
  {
    title: 'Фитнес',
    description:
      'Набор мышечной массы и увеличение силовых показателей с помощью комплексных упражнений.',
    image: '/img/3.jpg',
    duration: 25,
    difficulty: 'Средний',
    backgroundColor: '#FF6D00',
    workouts: [],
  },
  {
    title: 'Степ-аэробика',
    description: 'Интенсивные кардио упражнения для сжигания калорий и улучшения выносливости.',
    image: '/img/4.jpg',
    duration: 25,
    difficulty: 'Средний',
    backgroundColor: '#FF6A5A',
    workouts: [],
  },
  {
    title: 'Бодифлекс',
    description: 'Сложные асаны и техники дыхания для опытных практиков. Выход на новый уровень.',
    image: '/img/5.jpg',
    duration: 25,
    difficulty: 'Продвинутый',
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
      console.log(`  ${index + 1}. ${course.title} (${course.difficulty})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
}

seed();
