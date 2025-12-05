/**
 * @fileoverview Тесты для утилит lib/utils.ts
 */

// Мок для mongoose (избегаем проблем с ESM)
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(() => false),
    },
  },
}));

import {
  getYouTubeEmbedUrl,
  sortCoursesByOrder,
  calculateProgress,
  getProgressButtonText,
  safeJsonParse,
} from '../utils';

describe('getYouTubeEmbedUrl', () => {
  it('преобразует стандартный YouTube URL в embed формат', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('преобразует короткий YouTube URL в embed формат', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('возвращает embed URL без изменений', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('возвращает null для пустой строки', () => {
    expect(getYouTubeEmbedUrl('')).toBeNull();
  });

  it('возвращает null для невалидного URL', () => {
    expect(getYouTubeEmbedUrl('https://example.com/video')).toBeNull();
  });

  it('обрабатывает URL с дополнительными параметрами', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });
});

describe('sortCoursesByOrder', () => {
  const courses = [
    { _id: '1', nameRU: 'Фитнес' },
    { _id: '2', nameRU: 'Йога' },
    { _id: '3', nameRU: 'Стретчинг' },
    { _id: '4', nameRU: 'Бодифлекс' },
  ];

  it('сортирует курсы в заданном порядке', () => {
    const order = ['Йога', 'Стретчинг', 'Фитнес', 'Бодифлекс'];
    const sorted = sortCoursesByOrder(courses, order);

    expect(sorted[0].nameRU).toBe('Йога');
    expect(sorted[1].nameRU).toBe('Стретчинг');
    expect(sorted[2].nameRU).toBe('Фитнес');
    expect(sorted[3].nameRU).toBe('Бодифлекс');
  });

  it('помещает курсы не из списка в конец', () => {
    const order = ['Йога', 'Фитнес'];
    const sorted = sortCoursesByOrder(courses, order);

    expect(sorted[0].nameRU).toBe('Йога');
    expect(sorted[1].nameRU).toBe('Фитнес');
    // Остальные в конце
  });

  it('не изменяет исходный массив', () => {
    const order = ['Йога', 'Фитнес'];
    const originalFirst = courses[0].nameRU;
    sortCoursesByOrder(courses, order);

    expect(courses[0].nameRU).toBe(originalFirst);
  });

  it('возвращает пустой массив для пустого входа', () => {
    const sorted = sortCoursesByOrder([], ['Йога']);
    expect(sorted).toEqual([]);
  });
});

describe('calculateProgress', () => {
  it('вычисляет процент прогресса', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(25, 100)).toBe(25);
    expect(calculateProgress(3, 4)).toBe(75);
  });

  it('округляет результат до целого числа', () => {
    expect(calculateProgress(1, 3)).toBe(33);
    expect(calculateProgress(2, 3)).toBe(67);
  });

  it('ограничивает максимальное значение', () => {
    expect(calculateProgress(150, 100)).toBe(100);
    expect(calculateProgress(200, 100, 50)).toBe(50);
  });

  it('возвращает 0 при нулевом total', () => {
    expect(calculateProgress(50, 0)).toBe(0);
  });

  it('возвращает 0 при отрицательном total', () => {
    expect(calculateProgress(50, -10)).toBe(0);
  });
});

describe('getProgressButtonText', () => {
  it('возвращает "Начать тренировки" при 0%', () => {
    expect(getProgressButtonText(0)).toBe('Начать тренировки');
  });

  it('возвращает "Продолжить" при частичном прогрессе', () => {
    expect(getProgressButtonText(25)).toBe('Продолжить');
    expect(getProgressButtonText(50)).toBe('Продолжить');
    expect(getProgressButtonText(99)).toBe('Продолжить');
  });

  it('возвращает "Начать заново" при 100%', () => {
    expect(getProgressButtonText(100)).toBe('Начать заново');
  });

  it('возвращает "Начать заново" при прогрессе > 100%', () => {
    expect(getProgressButtonText(150)).toBe('Начать заново');
  });
});

describe('safeJsonParse', () => {
  it('парсит валидный JSON', () => {
    const json = '{"name": "test", "value": 123}';
    const result = safeJsonParse(json, {});

    expect(result).toEqual({ name: 'test', value: 123 });
  });

  it('возвращает fallback для невалидного JSON', () => {
    const fallback = { default: true };
    const result = safeJsonParse('not valid json', fallback);

    expect(result).toEqual(fallback);
  });

  it('возвращает fallback для null', () => {
    const fallback = { default: true };
    const result = safeJsonParse(null, fallback);

    expect(result).toEqual(fallback);
  });

  it('возвращает fallback для пустой строки', () => {
    const fallback = [];
    const result = safeJsonParse('', fallback);

    expect(result).toEqual(fallback);
  });

  it('корректно парсит массивы', () => {
    const json = '[1, 2, 3]';
    const result = safeJsonParse(json, []);

    expect(result).toEqual([1, 2, 3]);
  });
});
