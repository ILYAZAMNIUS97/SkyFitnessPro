import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import { ICourse } from '@/types/course';

type ResponseData = {
  success: boolean;
  data?: ICourse[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const courses = await Course.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: courses });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Не удалось получить курсы' });
      }
      break;

    case 'POST':
      try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: [course] });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Не удалось создать курс' });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Метод не поддерживается' });
      break;
  }
}

