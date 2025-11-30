/**
 * @fileoverview Тесты для констант lib/constants.ts
 */

import {
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  COURSES_DISPLAY_ORDER,
  SUCCESS_MODAL_AUTO_CLOSE_DELAY,
  SCROLL_TO_TOP_THRESHOLD,
  HTTP_STATUS,
  API_MESSAGES,
} from '../constants';

describe('Constants', () => {
  describe('JWT_EXPIRES_IN', () => {
    it('имеет корректное значение', () => {
      expect(JWT_EXPIRES_IN).toBe('7d');
    });
  });

  describe('BCRYPT_SALT_ROUNDS', () => {
    it('имеет корректное значение для безопасности', () => {
      expect(BCRYPT_SALT_ROUNDS).toBeGreaterThanOrEqual(10);
    });
  });

  describe('COURSES_DISPLAY_ORDER', () => {
    it('содержит все основные курсы', () => {
      expect(COURSES_DISPLAY_ORDER).toContain('Йога');
      expect(COURSES_DISPLAY_ORDER).toContain('Стретчинг');
      expect(COURSES_DISPLAY_ORDER).toContain('Фитнес');
    });

    it('является массивом строк', () => {
      expect(Array.isArray(COURSES_DISPLAY_ORDER)).toBe(true);
      COURSES_DISPLAY_ORDER.forEach((item) => {
        expect(typeof item).toBe('string');
      });
    });
  });

  describe('SUCCESS_MODAL_AUTO_CLOSE_DELAY', () => {
    it('имеет положительное значение', () => {
      expect(SUCCESS_MODAL_AUTO_CLOSE_DELAY).toBeGreaterThan(0);
    });

    it('является разумным временем задержки (1-10 секунд)', () => {
      expect(SUCCESS_MODAL_AUTO_CLOSE_DELAY).toBeGreaterThanOrEqual(1000);
      expect(SUCCESS_MODAL_AUTO_CLOSE_DELAY).toBeLessThanOrEqual(10000);
    });
  });

  describe('SCROLL_TO_TOP_THRESHOLD', () => {
    it('имеет положительное значение', () => {
      expect(SCROLL_TO_TOP_THRESHOLD).toBeGreaterThan(0);
    });
  });

  describe('HTTP_STATUS', () => {
    it('содержит стандартные HTTP коды', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('API_MESSAGES', () => {
    it('содержит сообщения на русском языке', () => {
      expect(API_MESSAGES.UNAUTHORIZED).toMatch(/[а-яА-Я]/);
      expect(API_MESSAGES.USER_NOT_FOUND).toMatch(/[а-яА-Я]/);
    });

    it('содержит все необходимые сообщения', () => {
      expect(API_MESSAGES.METHOD_NOT_ALLOWED).toBeDefined();
      expect(API_MESSAGES.UNAUTHORIZED).toBeDefined();
      expect(API_MESSAGES.INVALID_TOKEN).toBeDefined();
      expect(API_MESSAGES.USER_NOT_FOUND).toBeDefined();
      expect(API_MESSAGES.COURSE_NOT_FOUND).toBeDefined();
      expect(API_MESSAGES.SERVER_ERROR).toBeDefined();
    });
  });
});
