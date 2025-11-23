import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import { ICourse } from '@/types/course';

type ResponseData = {
  success: boolean;
  data?: ICourse;
  error?: string;
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
        const course = await Course.findById(id).populate('workouts');
        if (!course) {
          return res.status(404).json({ success: false, error: 'Курс не найден' });
        }
        res.status(200).json({ success: true, data: course });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Не удалось получить курс' });
      }
      break;

    case 'PUT':
      try {
        const course = await Course.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!course) {
          return res.status(404).json({ success: false, error: 'Курс не найден' });
        }
        res.status(200).json({ success: true, data: course });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Не удалось обновить курс' });
      }
      break;

    case 'DELETE':
      try {
        const deletedCourse = await Course.deleteOne({ _id: id });
        if (!deletedCourse.deletedCount) {
          return res.status(404).json({ success: false, error: 'Курс не найден' });
        }
        res.status(200).json({ success: true, data: undefined });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Не удалось удалить курс' });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Метод не поддерживается' });
      break;
  }
}

