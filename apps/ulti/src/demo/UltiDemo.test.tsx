import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UltiDemo } from './UltiDemo';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const tableText = () => screen.getByTestId('ulti-table').textContent;

describe('UltiDemo', () => {
  it('three bots play real deals while active, writing nothing to storage', () => {
    render(<UltiDemo active />);
    const start = tableText();
    tick(3000);
    expect(tableText()).not.toBe(start);
    // Long enough to finish a deal and start the next.
    for (let i = 0; i < 80; i += 1) tick(1500);
    expect(screen.getByTestId('ulti-demo').textContent).toMatch(/Bandi|Teri/);
    expect(localStorage.length).toBe(0);
  });

  it('freezes while inactive', () => {
    const { rerender } = render(<UltiDemo active={false} />);
    const frozen = tableText();
    tick(10000);
    expect(tableText()).toBe(frozen);
    rerender(<UltiDemo active />);
    tick(3000);
    expect(tableText()).not.toBe(frozen);
  });
});
