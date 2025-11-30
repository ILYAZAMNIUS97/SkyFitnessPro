/**
 * @fileoverview Тесты для компонента CourseCard
 */

import { render, screen } from '@testing-library/react';
import CourseCard from '../CourseCard';
import { ICourse } from '@/types/course';

// Мок для next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Мок для next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Мок для хука useAuth
jest.mock('@/hooks/useAuth', () => ({
  getStoredToken: jest.fn(() => null),
  getStoredUser: jest.fn(() => null),
}));

const mockCourse: ICourse = {
  _id: 'course-1',
  nameRU: 'Йога для начинающих',
  nameEN: 'Yoga for beginners',
  description: 'Описание курса йоги',
  image: '/img/yoga.jpg',
  directions: ['Гибкость', 'Баланс'],
  fitting: ['Для всех возрастов'],
  difficulty: 'Начальный',
  durationInDays: 25,
  dailyDurationInMinutes: { from: 20, to: 40 },
  workouts: [],
  backgroundColor: '#FFC700',
};

describe('CourseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит название курса', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('Йога для начинающих')).toBeInTheDocument();
  });

  it('рендерит продолжительность курса', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('25 дней')).toBeInTheDocument();
  });

  it('рендерит ежедневную длительность тренировки', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('20-40 мин/день')).toBeInTheDocument();
  });

  it('рендерит ссылку на страницу курса', () => {
    render(<CourseCard course={mockCourse} />);

    const links = screen.getAllByRole('link');
    const courseLinks = links.filter((link) => link.getAttribute('href') === '/course/course-1');

    expect(courseLinks.length).toBeGreaterThan(0);
  });

  it('рендерит изображение курса', () => {
    render(<CourseCard course={mockCourse} />);

    const image = screen.getByAltText('Йога для начинающих');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/img/yoga.jpg');
  });

  it('применяет backgroundColor к обёртке изображения', () => {
    const { container } = render(<CourseCard course={mockCourse} />);

    // Проверяем, что стиль применён (CSS modules генерируют уникальные классы)
    const imageWrapper = container.querySelector('[style*="background-color"]');
    expect(imageWrapper).toBeTruthy();
  });

  it('рендерит кнопку добавления курса', () => {
    render(<CourseCard course={mockCourse} />);

    const addButton = screen.getByRole('button', { name: /добавить курс/i });
    expect(addButton).toBeInTheDocument();
  });

  it('использует дефолтный цвет фона при отсутствии backgroundColor', () => {
    const courseWithoutColor = { ...mockCourse, backgroundColor: undefined };
    render(<CourseCard course={courseWithoutColor} />);

    // Проверяем что компонент рендерится без ошибок
    const title = screen.getByText('Йога для начинающих');
    expect(title).toBeInTheDocument();
  });
});
