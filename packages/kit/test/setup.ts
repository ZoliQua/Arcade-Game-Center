import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node >= 25 ships its own global `localStorage` (undefined unless started with
// --localstorage-file), which shadows jsdom's. Point both names at jsdom's.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (dom) {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] });
  }
}

// Vitest runs without globals, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup());

// jsdom has no PointerEvent: a MouseEvent subclass carries clientX/Y, pointerId and pointerType for drag
// and touch tests (same polyfill as the Solitaire repo's own src/test/setup.ts). It is installed before any
// game test's own polyfill, so it must carry pointerType too or touch taps read as mouse clicks.
for (const win of [dom?.window, globalThis as unknown as Window & typeof globalThis].filter(Boolean) as (Window & typeof globalThis)[]) {
  if (typeof win.PointerEvent === 'undefined') {
    class PointerEventPolyfill extends win.MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? 'mouse';
      }
    }
    Object.defineProperty(win, 'PointerEvent', { configurable: true, writable: true, value: PointerEventPolyfill });
  }
}

// jsdom does not implement scrolling; full-screen mode restores the scroll position on exit.
window.scrollTo = () => {};

// apps/<id>/ mirrors a standalone repo whose tests run from that repo's root (`npm test` there), so a test
// may read its own files relative to process.cwd(). Run each app's tests from its folder; everything else
// from the monorepo root.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const app = /[\\/]apps[\\/]([^\\/]+)[\\/]/.exec(expect.getState().testPath ?? '');
process.chdir(app ? resolve(ROOT, 'apps', app[1]) : ROOT);
