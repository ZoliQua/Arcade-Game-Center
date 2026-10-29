import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStats } from '../arcade';
import { PADDLE_Y } from '../logic/constants';
import { BreakoutDemo } from './BreakoutDemo';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('<BreakoutDemo />', () => {
  const ballY = (container: HTMLElement) => Number(container.querySelector('circle')?.getAttribute('cy'));

  it('plays by itself without touching stats or saves', () => {
    const { container } = render(<BreakoutDemo />);
    expect(container.querySelector('.arc-demo')).toBeTruthy();
    expect(container.querySelector('button, [tabindex]')).toBeNull();
    const start = ballY(container);
    act(() => vi.advanceTimersByTime(3000));
    expect(ballY(container)).not.toBeCloseTo(start);
    expect(ballY(container)).toBeLessThan(PADDLE_Y);
    expect(readStats('breakout').plays).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('freezes when inactive', () => {
    const { container } = render(<BreakoutDemo active={false} />);
    const start = container.innerHTML;
    act(() => vi.advanceTimersByTime(3000));
    expect(container.innerHTML).toBe(start);
  });
});
