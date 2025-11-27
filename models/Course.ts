import mongoose, { Schema, Model } from 'mongoose';
import { ICourse } from '@/types/course';

const CourseSchema = new Schema<ICourse>(
  {
    nameRU: {
      type: String,
      required: [true, 'Название курса на русском обязательно'],
      trim: true,
    },
    nameEN: {
      type: String,
      required: [true, 'Название курса на английском обязательно'],
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
    heroImage: {
      type: String,
      required: false,
    },
    directions: {
      type: [String],
      default: [],
    },
    fitting: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      required: [true, 'Уровень сложности обязателен'],
    },
    durationInDays: {
      type: Number,
      required: [true, 'Продолжительность курса обязательна'],
    },
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
