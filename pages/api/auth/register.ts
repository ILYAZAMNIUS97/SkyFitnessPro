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

  const { email, password, confirmPassword, name } = req.body ?? {};

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Заполните обязательные поля' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Пароли не совпадают' });
  }

  try {
    await dbConnect();

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: 'Данная почта уже используется. Попробуйте войти.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fallbackName =
      (typeof name === 'string' && name.trim()) ||
      normalizedEmail.split('@')[0] ||
      'Новый пользователь';

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: fallbackName,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Пользователь создан',
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Не удалось завершить регистрацию' });
  }
}
