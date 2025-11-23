import mongoose, { Schema, Model } from 'mongoose';
import { IWorkout, IExercise } from '@/types/course';

const ExerciseSchema = new Schema<IExercise>(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['повторения', 'минуты', 'секунды'],
      required: true,
    },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    courseId: {
      type: String,
      required: true,
      ref: 'Course',
    },
    title: {
      type: String,
      required: [true, 'Название тренировки обязательно'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Описание тренировки обязательно'],
    },
    videoUrl: {
      type: String,
    },
    exercises: [ExerciseSchema],
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

const Workout: Model<IWorkout> =
  mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default Workout;

