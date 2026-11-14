import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { applyLang } from '../src/i18n';
import { useLongPress, useSwipe, type SwipeDir } from '../src/touch';
import { TouchPad } from '../src/components/TouchPad';

function mockPointer(coarse: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: coarse && query.includes('coarse'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  act(() => applyLang('en'));
  mockPointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const touch = (x: number, y: number) => ({ clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0 });

function SwipeBoard({ onSwipe, onTap }: { onSwipe: (d: SwipeDir, info: { dx: number; dy: number; ms: number }) => void; onTap?: (e: PointerEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSwipe(ref, onSwipe, { onTap });
  return (
    <div ref={ref} data-testid="board">
      <button type="button">btn</button>
      <span data-no-swipe="">skip</span>
      <span>cell</span>
    </div>
  );
}

describe('useSwipe', () => {
  it('a 40 px drag to the left is a left swipe', () => {
    const onSwipe = vi.fn();
    const onTap = vi.fn();
    render(<SwipeBoard onSwipe={onSwipe} onTap={onTap} />);
    const board = screen.getByTestId('board');
    fireEvent.pointerDown(board, touch(100, 100));
    fireEvent.pointerMove(board, touch(80, 102));
    fireEvent.pointerUp(board, touch(60, 103));
    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe.mock.calls[0][0]).toBe('left');
    expect(onSwipe.mock.calls[0][1]).toMatchObject({ dx: -40, dy: 3 });
    expect(onTap).not.toHaveBeenCalled();
  });

  it('detects the dominant axis (down, up, right)', () => {
    const onSwipe = vi.fn();
    render(<SwipeBoard onSwipe={onSwipe} />);
    const board = screen.getByTestId('board');
    for (const [x, y] of [
      [105, 150],
      [90, 60],
      [140, 110],
    ]) {
      fireEvent.pointerDown(board, touch(100, 100));
      fireEvent.pointerUp(board, touch(x, y));
    }
    expect(onSwipe.mock.calls.map((c) => c[0])).toEqual(['down', 'up', 'right']);
  });

  it('a 10 px movement is a tap, not a swipe', () => {
    const onSwipe = vi.fn();
    const onTap = vi.fn();
    render(<SwipeBoard onSwipe={onSwipe} onTap={onTap} />);
    const board = screen.getByTestId('board');
    fireEvent.pointerDown(board, touch(100, 100));
    fireEvent.pointerUp(board, touch(110, 100));
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('ignores gestures that start on interactive elements', () => {
    const onSwipe = vi.fn();
    const onTap = vi.fn();
    render(<SwipeBoard onSwipe={onSwipe} onTap={onTap} />);
    for (const el of [screen.getByRole('button'), screen.getByText('skip')]) {
      fireEvent.pointerDown(el, touch(100, 100));
      fireEvent.pointerUp(el, touch(40, 100));
      fireEvent.pointerDown(el, touch(100, 100));
      fireEvent.pointerUp(el, touch(100, 100));
    }
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByText('cell'), touch(100, 100));
    fireEvent.pointerUp(screen.getByText('cell'), touch(100, 40));
    expect(onSwipe).toHaveBeenCalledWith('up', expect.objectContaining({ dx: 0, dy: -60 }));
  });

  it('a cancelled gesture does nothing', () => {
    const onSwipe = vi.fn();
    const onTap = vi.fn();
    render(<SwipeBoard onSwipe={onSwipe} onTap={onTap} />);
    const board = screen.getByTestId('board');
    fireEvent.pointerDown(board, touch(100, 100));
    fireEvent.pointerCancel(board, touch(40, 100));
    fireEvent.pointerUp(board, touch(40, 100));
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
  });
});

function Pressable({ onLong, onClick }: { onLong: (e: PointerEvent) => void; onClick: () => void }) {
  const handlers = useLongPress(onLong);
  return (
    <button type="button" {...handlers} onClick={onClick}>
      cell
    </button>
  );
}

describe('useLongPress', () => {
  it('fires after 400 ms, vibrates and suppresses the following click', () => {
    vi.useFakeTimers();
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
    const onLong = vi.fn();
    const onClick = vi.fn();
    render(<Pressable onLong={onLong} onClick={onClick} />);
    const btn = screen.getByRole('button');
    fireEvent.pointerDown(btn, touch(10, 10));
    act(() => vi.advanceTimersByTime(399));
    expect(onLong).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onLong).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(15);
    fireEvent.pointerUp(btn, touch(10, 10));
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    // The next, ordinary click works again.
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    delete (navigator as { vibrate?: unknown }).vibrate;
  });

  it('a short press does not fire and keeps the click', () => {
    vi.useFakeTimers();
    const onLong = vi.fn();
    const onClick = vi.fn();
    render(<Pressable onLong={onLong} onClick={onClick} />);
    const btn = screen.getByRole('button');
    fireEvent.pointerDown(btn, touch(10, 10));
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerUp(btn, touch(10, 10));
    fireEvent.click(btn);
    act(() => vi.advanceTimersByTime(1000));
    expect(onLong).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('leaving or cancelling before 400 ms does not fire', () => {
    vi.useFakeTimers();
    const onLong = vi.fn();
    render(<Pressable onLong={onLong} onClick={() => {}} />);
    const btn = screen.getByRole('button');
    fireEvent.pointerDown(btn, touch(10, 10));
    fireEvent.pointerLeave(btn, touch(10, 10));
    fireEvent.pointerDown(btn, touch(10, 10));
    fireEvent.pointerCancel(btn, touch(10, 10));
    act(() => vi.advanceTimersByTime(1000));
    expect(onLong).not.toHaveBeenCalled();
  });
});

describe('TouchPad', () => {
  const buttons = (onPress: () => void, repeat = false) => [
    { id: 'left', label: 'Left', icon: '◀', onPress, repeat },
    { id: 'right', label: 'Right', icon: '▶', onPress: () => {} },
  ];

  it('is absent with a fine pointer', () => {
    render(<TouchPad buttons={buttons(() => {})} layout="row" />);
    expect(screen.queryByRole('button', { name: 'Left' })).toBeNull();
  });

  it('is present with a coarse pointer and presses on pointer down', () => {
    mockPointer(true);
    const onPress = vi.fn();
    render(<TouchPad buttons={buttons(onPress)} layout="dpad" />);
    const left = screen.getByRole('button', { name: 'Left' });
    expect(screen.getByRole('button', { name: 'Right' })).toBeTruthy();
    fireEvent.pointerDown(left, touch(5, 5));
    fireEvent.pointerUp(left, touch(5, 5));
    fireEvent.click(left, { detail: 1 });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a keyboard click (detail 0) also presses', () => {
    mockPointer(true);
    const onPress = vi.fn();
    render(<TouchPad buttons={buttons(onPress)} layout="row" />);
    fireEvent.click(screen.getByRole('button', { name: 'Left' }), { detail: 0 });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('repeat fires at least twice over 400 ms while held and stops on release', () => {
    vi.useFakeTimers();
    mockPointer(true);
    const onPress = vi.fn();
    render(<TouchPad buttons={buttons(onPress, true)} layout="row" />);
    const left = screen.getByRole('button', { name: 'Left' });
    fireEvent.pointerDown(left, touch(5, 5));
    act(() => vi.advanceTimersByTime(400));
    expect(onPress.mock.calls.length).toBeGreaterThanOrEqual(2);
    fireEvent.pointerUp(left, touch(5, 5));
    const n = onPress.mock.calls.length;
    act(() => vi.advanceTimersByTime(600));
    expect(onPress).toHaveBeenCalledTimes(n);
  });
});
