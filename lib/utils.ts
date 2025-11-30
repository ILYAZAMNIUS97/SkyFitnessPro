/**
 * @fileoverview Общие утилиты приложения SkyFitnessPro
 */

import mongoose from 'mongoose';

/**
 * Извлекает ID видео из YouTube URL и возвращает embed URL
 * Поддерживает форматы:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param url - URL видео на YouTube
 * @returns Embed URL или null если не удалось извлечь
 *
 * @example
 * const embedUrl = getYouTubeEmbedUrl('https://youtu.be/abc123');
 * // => 'https://www.youtube.com/embed/abc123'
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let videoId = '';

  try {
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }
  } catch {
    // Fallback для некорректных URL
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match?.[1] || '';
    }
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

/**
 * Сортирует курсы по заданному порядку названий
 *
 * @param courses - Массив курсов для сортировки
 * @param order - Массив названий в нужном порядке
 * @param nameKey - Ключ для получения названия (по умолчанию 'nameRU')
 * @returns Отсортированный массив курсов
 *
 * @example
 * const sorted = sortCoursesByOrder(courses, ['Йога', 'Фитнес']);
 */
export function sortCoursesByOrder<T>(
  courses: T[],
  order: string[],
  nameKey: string = 'nameRU'
): T[] {
  return [...courses].sort((a, b) => {
    const nameA = String((a as Record<string, unknown>)[nameKey] || '');
    const nameB = String((b as Record<string, unknown>)[nameKey] || '');
    const indexA = order.indexOf(nameA);
    const indexB = order.indexOf(nameB);

    // Курсы не из списка помещаем в конец
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

/**
 * Сериализует MongoDB документ для передачи через props
 * Преобразует ObjectId в строки и Date в ISO строки
 *
 * @param doc - MongoDB документ (lean)
 * @returns Сериализованный объект
 *
 * @example
 * const course = await Course.findById(id).lean();
 * return { props: { course: serializeDocument(course) } };
 */
export function serializeDocument<T>(doc: T | null): T | null {
  if (!doc) return null;

  const serialized: Record<string, unknown> = {};
  const docRecord = doc as Record<string, unknown>;

  for (const [key, value] of Object.entries(docRecord)) {
    if (value === null || value === undefined) {
      serialized[key] = value;
    } else if (
      mongoose.Types.ObjectId.isValid(value as string) &&
      typeof value === 'object' &&
      'toString' in value
    ) {
      // ObjectId
      serialized[key] = (value as { toString: () => string }).toString();
    } else if (value instanceof Date) {
      // Date
      serialized[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      // Array
      serialized[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null && 'toString' in item) {
          // ObjectId в массиве
          if (mongoose.Types.ObjectId.isValid((item as { toString: () => string }).toString())) {
            return (item as { toString: () => string }).toString();
          }
          // Вложенный объект
          return serializeDocument(item);
        }
        return item;
      });
    } else if (typeof value === 'object') {
      // Вложенный объект
      serialized[key] = serializeDocument(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized as T;
}

/**
 * Сериализует массив MongoDB документов
 *
 * @param docs - Массив документов
 * @returns Массив сериализованных объектов
 */
export function serializeDocuments<T>(docs: T[]): T[] {
  return docs.map((doc) => serializeDocument(doc)!);
}

/**
 * Вычисляет процент прогресса
 *
 * @param completed - Количество выполненных
 * @param total - Общее количество
 * @param maxPercent - Максимальный процент (по умолчанию 100)
 * @returns Процент от 0 до maxPercent
 *
 * @example
 * const progress = calculateProgress(3, 5); // => 60
 */
export function calculateProgress(
  completed: number,
  total: number,
  maxPercent: number = 100
): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((completed / total) * 100), maxPercent);
}

/**
 * Форматирует текст кнопки в зависимости от прогресса
 *
 * @param progress - Текущий прогресс (0-100)
 * @returns Текст кнопки
 */
export function getProgressButtonText(progress: number): string {
  if (progress === 0) return 'Начать тренировки';
  if (progress >= 100) return 'Начать заново';
  return 'Продолжить';
}

/**
 * Проверяет, является ли значение валидным MongoDB ObjectId
 *
 * @param id - Строка для проверки
 * @returns true если валидный ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Безопасно парсит JSON строку
 *
 * @param json - JSON строка
 * @param fallback - Значение по умолчанию при ошибке
 * @returns Распарсенный объект или fallback
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
