import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Workout from '@/models/Workout';
import { IWorkout } from '@/types/course';

type ResponseData = {
  success: boolean;
  data?: IWorkout | IWorkout[];
  error?: string;
  debug?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        console.log('=== API /api/workouts/[id] ===');
        console.log('Requested ID:', id);
        console.log('ID type:', typeof id);
        console.log('Method:', method);

        // Нормализуем ID - всегда используем строку для поиска
        const searchId = String(id);
        console.log('Search ID (normalized):', searchId);

        // Если id - это courseId, получаем все тренировки курса
        // Пробуем разные варианты поиска
        let workouts = await Workout.find({ courseId: searchId }).sort({ order: 1 });
        console.log('Found workouts by courseId (exact match):', workouts.length);

        // Если не нашли, пробуем найти как ObjectId
        if (workouts.length === 0) {
          try {
            const mongoose = require('mongoose');
            const objectId = new mongoose.Types.ObjectId(searchId);
            workouts = await Workout.find({ courseId: objectId.toString() }).sort({ order: 1 });
            console.log('Found workouts by courseId (as ObjectId string):', workouts.length);
          } catch (e) {
            console.log('Could not convert to ObjectId:', e);
          }
        }

        console.log(
          'Workouts found:',
          workouts.map((w) => ({
            _id: w._id.toString(),
            courseId: w.courseId,
            courseIdType: typeof w.courseId,
            title: w.title,
          }))
        );

        if (workouts.length === 0) {
          // Проверим, есть ли вообще тренировки в базе
          const allWorkouts = await Workout.find({}).limit(10);
          console.log('Total workouts in DB:', allWorkouts.length);
          console.log(
            'Sample workouts in DB:',
            allWorkouts.map((w) => ({
              _id: w._id.toString(),
              courseId: w.courseId,
              courseIdType: typeof w.courseId,
              title: w.title,
            }))
          );

          // Попробуем найти тренировку по её собственному ID
          const workout = await Workout.findById(id);
          console.log('Workout found by _id:', workout ? 'Yes' : 'No');

          if (!workout) {
            // Попробуем найти тренировки с разными вариантами courseId
            const workoutsAsString = await Workout.find({ courseId: String(id) }).sort({
              order: 1,
            });

            console.log('Workouts found with courseId as String:', workoutsAsString.length);

            return res.status(404).json({
              success: false,
              error: 'Тренировки не найдены',
              debug: {
                requestedCourseId: id,
                requestedCourseIdType: typeof id,
                normalizedSearchId: searchId,
                totalWorkoutsInDB: allWorkouts.length,
                sampleWorkouts: allWorkouts.slice(0, 3).map((w) => ({
                  _id: w._id.toString(),
                  courseId: w.courseId,
                  courseIdType: typeof w.courseId,
                  title: w.title,
                })),
              },
            });
          }
          return res.status(200).json({ success: true, data: workout });
        }

        console.log('Returning workouts:', workouts.length);
        res.status(200).json({ success: true, data: workouts });
      } catch (error) {
        console.error('Error fetching workouts:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        res.status(500).json({ success: false, error: 'Не удалось получить тренировки' });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Метод не поддерживается' });
      break;
  }
}
