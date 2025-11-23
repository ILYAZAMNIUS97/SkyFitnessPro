import { ICourse } from '@/types/course';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchCourses(): Promise<ICourse[]> {
  try {
    const res = await fetch(`${API_URL}/api/courses`);
    if (!res.ok) {
      throw new Error('Не удалось загрузить курсы');
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function fetchCourseById(id: string): Promise<ICourse | null> {
  try {
    const res = await fetch(`${API_URL}/api/courses/${id}`);
    if (!res.ok) {
      throw new Error('Не удалось загрузить курс');
    }
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

