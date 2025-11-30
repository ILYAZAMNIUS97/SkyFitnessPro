const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Путь к Next.js приложению для загрузки next.config.js и .env файлов
  dir: './',
});

// Добавляем кастомную конфигурацию Jest
const customJestConfig = {
  // Тестовая среда
  testEnvironment: 'jest-environment-jsdom',

  // Пути для модулей и CSS модулей
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },

  // Расширения файлов для тестов
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Игнорируемые пути
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Настройка setup файлов
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Коллекторы покрытия
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
};

// Создаем и экспортируем конфигурацию
module.exports = createJestConfig(customJestConfig);
