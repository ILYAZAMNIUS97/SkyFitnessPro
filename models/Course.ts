import mongoose, { Schema, Model } from 'mongoose';
import { ICourse } from '@/types/course';

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Название курса обязательно'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Описание курса обязательно'],
    },
    image: {
      type: String,
      required: [true, 'Изображение курса обязательно'],
    },
    duration: {
      type: Number,
      required: [true, 'Продолжительность курса обязательна'],
    },
    difficulty: {
      type: String,
      enum: ['Начальный', 'Средний', 'Продвинутый'],
      required: [true, 'Уровень сложности обязателен'],
    },
    backgroundColor: {
      type: String,
      required: false,
    },
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

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
