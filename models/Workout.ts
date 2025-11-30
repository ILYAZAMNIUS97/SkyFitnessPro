/**
 * @fileoverview Mongoose модель тренировки
 * Содержит схему тренировки с упражнениями
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IWorkout, IExercise } from '@/types/course';

/**
 * Схема упражнения
 * Встроенный документ в схеме тренировки
 */
const ExerciseSchema = new Schema<IExercise>(
  {
    /** Название упражнения */
    name: {
      type: String,
      required: true,
    },
    /** Целевое количество повторений/минут/секунд */
    quantity: {
      type: Number,
      required: true,
    },
    /** Единица измерения */
    unit: {
      type: String,
      enum: ['повторения', 'минуты', 'секунды'],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Схема тренировки
 *
 * @example
 * const workout = await Workout.create({
 *   courseId: course._id.toString(),
 *   title: 'Утренняя йога',
 *   description: 'Комплекс упражнений для начала дня',
 *   videoUrl: 'https://youtube.com/watch?v=...',
 *   exercises: [
 *     { name: 'Приветствие солнцу', quantity: 5, unit: 'минуты' }
 *   ],
 *   order: 1
 * });
 */
const WorkoutSchema = new Schema<IWorkout>(
  {
    /** ID курса, к которому относится тренировка */
    courseId: {
      type: String,
      required: true,
      ref: 'Course',
    },
    /** Название тренировки */
    title: {
      type: String,
      required: [true, 'Название тренировки обязательно'],
      trim: true,
    },
    /** Описание тренировки */
    description: {
      type: String,
      required: [true, 'Описание тренировки обязательно'],
    },
    /** URL видео тренировки (YouTube) */
    videoUrl: {
      type: String,
    },
    /** Список упражнений */
    exercises: [ExerciseSchema],
    /** Порядковый номер тренировки в курсе */
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Модель тренировки MongoDB
 */
const Workout: Model<IWorkout> =
  mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default Workout;
