import mongoose, { Schema, Model } from 'mongoose';
import { IUser, IUserProgress } from '@/types/course';

const UserProgressSchema = new Schema<IUserProgress>(
  {
    courseId: {
      type: String,
      required: true,
      ref: 'Course',
    },
    workoutId: {
      type: String,
      required: true,
      ref: 'Workout',
    },
    completedExercises: [
      {
        exerciseName: String,
        completed: Number,
      },
    ],
    completedAt: Date,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    progress: [UserProgressSchema],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

