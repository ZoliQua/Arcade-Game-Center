import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameOverlay } from '../src/components/ArcadeUI';

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

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const overlay = () => (
  <GameOverlay title="Paused" actions={[{ label: 'Resume', onClick: () => {}, primary: true, kbd: 'P' }]} />
);

describe('GameOverlay key hints', () => {
  it('shows the key hint with a fine pointer', () => {
    mockPointer(false);
    const { container } = render(overlay());
    expect(container.querySelector('kbd')?.textContent).toBe('P');
  });

  it('hides the key hint on a touch device (coarse pointer)', () => {
    mockPointer(true);
    const { container, getByRole } = render(overlay());
    expect(container.querySelector('kbd')).toBeNull();
    expect(getByRole('button', { name: 'Resume' })).toBeTruthy();
  });
});

/** jsdom does not evaluate media queries, so the touch-only rules are checked in the stylesheet itself. */
describe('arcade.css on touch', () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/arcade.css'), 'utf8');
  const coarseBlocks = [...css.matchAll(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]);
  const coarse = coarseBlocks.join('\n');

  it('hides hard-coded key hints inside buttons', () => {
    expect(coarse).toMatch(/\.arc-btn \.arc-kbd,\s*\.arc-btn kbd\s*\{\s*display: none;/);
  });

  it('gives the header controls a 44 px touch target', () => {
    const rule = coarse.match(/([^{}]*)\{[^{}]*min-height: 44px;[^{}]*min-width: 44px;[^{}]*\}/g)?.join('\n') ?? '';
    for (const sel of ['.arc-icon-btn', '.arc-lang__btn', '.arc-dental-toggle', '.arc-topbar .arc-btn']) {
      expect(rule).toContain(sel);
    }
  });

  it('keeps the desktop header size (34 px) outside the touch query', () => {
    expect(css).toMatch(/\.arc-icon-btn \{\s*width: 34px;\s*height: 34px;/);
    expect(css).toMatch(/\.arc-lang__btn,\s*\.arc-dental-toggle \{\s*height: 34px;/);
  });
});
