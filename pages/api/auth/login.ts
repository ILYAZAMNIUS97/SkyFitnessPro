import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'skyfitnesspro-dev-secret';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Укажите почту и пароль' });
  }

  try {
    await dbConnect();

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Пользователь не найден. Попробуйте зарегистрироваться.',
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Пароль введен неверно, попробуйте ещё раз.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Успешный вход',
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Не удалось выполнить вход' });
  }
}
