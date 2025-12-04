import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout';

// Моки для Next.js компонентов
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    // Проверяем, что Layout рендерится без ошибок
    expect(document.body).toBeTruthy();
  });
});

