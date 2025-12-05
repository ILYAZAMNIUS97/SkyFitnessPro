/**
 * @fileoverview Тесты для хука useModal
 */

import { renderHook, act } from '@testing-library/react';
import { useModal, useAutoClose } from '../useModal';

describe('useModal', () => {
  it('возвращает handleOverlayClick функцию', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useModal({ onClose }));

    expect(typeof result.current.handleOverlayClick).toBe('function');
  });

  it('вызывает onClose при клике на оверлей', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useModal({ onClose }));

    // Создаём mock события где target === currentTarget
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as unknown as React.MouseEvent;
    mockEvent.target = mockEvent.currentTarget;

    act(() => {
      result.current.handleOverlayClick(mockEvent);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onClose при клике на содержимое модального окна', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useModal({ onClose }));

    // Создаём mock события где target !== currentTarget
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleOverlayClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('добавляет обработчик Escape при closeOnEscape=true', () => {
    const onClose = jest.fn();
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    renderHook(() => useModal({ onClose, closeOnEscape: true }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('блокирует скролл при blockScroll=true', () => {
    const onClose = jest.fn();
    const originalOverflow = document.body.style.overflow;

    const { unmount } = renderHook(() => useModal({ onClose, blockScroll: true }));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});

describe('useAutoClose', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('вызывает onClose после указанной задержки', () => {
    const onClose = jest.fn();

    renderHook(() => useAutoClose(onClose, 2000));

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('использует задержку по умолчанию 2000мс', () => {
    const onClose = jest.fn();

    renderHook(() => useAutoClose(onClose));

    act(() => {
      jest.advanceTimersByTime(1999);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('очищает таймер при размонтировании', () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() => useAutoClose(onClose, 2000));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
