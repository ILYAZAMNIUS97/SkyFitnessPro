/**
 * @fileoverview Mongoose модель пользователя
 * Содержит схему пользователя с курсами и прогрессом тренировок
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IUser, IUserProgress } from '@/types/course';

/**
 * Схема прогресса пользователя
 * Хранит информацию о выполненных упражнениях для каждой тренировки
 */
const UserProgressSchema = new Schema<IUserProgress>(
  {
    /** ID курса */
    courseId: {
      type: String,
      required: true,
      ref: 'Course',
    },
    /** ID тренировки */
    workoutId: {
      type: String,
      required: true,
      ref: 'Workout',
    },
    /** Выполненные упражнения */
    completedExercises: [
      {
        exerciseName: String,
        completed: Number,
      },
    ],
    /** Дата завершения тренировки */
    completedAt: Date,
  },
  { _id: false }
);

/**
 * Схема пользователя
 *
 * @example
 * const user = await User.create({
 *   email: 'user@example.com',
 *   password: hashedPassword,
 *   name: 'Иван Иванов'
 * });
 */
const UserSchema = new Schema<IUser>(
  {
    /** Email пользователя (уникальный, нижний регистр) */
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Хешированный пароль */
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: 6,
    },
    /** Имя пользователя для отображения */
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    /** ID курсов, на которые подписан пользователь */
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    /** Прогресс по тренировкам */
    progress: [UserProgressSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * Модель пользователя MongoDB
 */
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
