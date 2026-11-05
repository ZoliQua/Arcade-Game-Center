import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, DENTAL_EVENT, DENTAL_KEY, readDental } from '../src/dental';
import { useDental } from '../src/hooks';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('dental mode', () => {
  it('is off by default', () => {
    expect(readDental()).toBe(false);
  });

  it('applyDental persists "1"/"0" and fires arcade:dental', () => {
    const seen: unknown[] = [];
    const on = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener(DENTAL_EVENT, on);
    applyDental(true);
    expect(localStorage.getItem(DENTAL_KEY)).toBe('1');
    expect(readDental()).toBe(true);
    applyDental(false);
    expect(localStorage.getItem(DENTAL_KEY)).toBe('0');
    window.removeEventListener(DENTAL_EVENT, on);
    expect(seen).toEqual([true, false]);
    expect(DENTAL_EVENT).toBe('arcade:dental');
    expect(DENTAL_KEY).toBe('arcade.dental');
  });

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readDental()).toBe(false);
  });

  it('useDental follows changes from anywhere on the page', () => {
    const { result } = renderHook(() => useDental());
    expect(result.current[0]).toBe(false);
    act(() => applyDental(true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(readDental()).toBe(false);
  });

  it('useDental still switches when storage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const a = renderHook(() => useDental());
    const b = renderHook(() => useDental());
    act(() => a.result.current[1](true));
    expect(b.result.current[0]).toBe(true);
    expect(document.documentElement.getAttribute('data-dental')).toBe('on');
  });

  it('a hook mounted after a switch sees it when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    applyDental(true);
    expect(renderHook(() => useDental()).result.current[0]).toBe(true);
    applyDental(false);
    expect(renderHook(() => useDental()).result.current[0]).toBe(false);
  });
});
