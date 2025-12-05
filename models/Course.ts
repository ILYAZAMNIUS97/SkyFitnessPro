/**
 * @fileoverview Mongoose модель курса
 * Содержит схему курса с тренировками и метаданными
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ICourse } from '@/types/course';

/**
 * Схема курса
 *
 * @example
 * const course = await Course.create({
 *   nameRU: 'Йога',
 *   nameEN: 'Yoga',
 *   description: 'Курс йоги для начинающих',
 *   image: '/img/yoga.jpg',
 *   difficulty: 'Начальный',
 *   durationInDays: 25,
 *   dailyDurationInMinutes: { from: 20, to: 40 }
 * });
 */
const CourseSchema = new Schema<ICourse>(
  {
    /** Название курса на русском */
    nameRU: {
      type: String,
      required: [true, 'Название курса на русском обязательно'],
      trim: true,
    },
    /** Название курса на английском */
    nameEN: {
      type: String,
      required: [true, 'Название курса на английском обязательно'],
      trim: true,
    },
    /** Описание курса */
    description: {
      type: String,
      required: [true, 'Описание курса обязательно'],
    },
    /** URL изображения для карточки */
    image: {
      type: String,
      required: [true, 'Изображение курса обязательно'],
    },
    /** URL изображения для hero-баннера */
    heroImage: {
      type: String,
      required: false,
    },
    /** Направления курса */
    directions: {
      type: [String],
      default: [],
    },
    /** Для кого подходит курс */
    fitting: {
      type: [String],
      default: [],
    },
    /** Уровень сложности */
    difficulty: {
      type: String,
      required: [true, 'Уровень сложности обязателен'],
    },
    /** Продолжительность курса в днях */
    durationInDays: {
      type: Number,
      required: [true, 'Продолжительность курса обязательна'],
    },
    /** Продолжительность ежедневных тренировок (диапазон в минутах) */
    dailyDurationInMinutes: {
      from: {
        type: Number,
        required: true,
      },
      to: {
        type: Number,
        required: true,
      },
    },
    /** Цвет фона для карточки */
    backgroundColor: {
      type: String,
      required: false,
    },
    /** ID тренировок курса */
    workouts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Workout',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Модель курса MongoDB
 */
const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
