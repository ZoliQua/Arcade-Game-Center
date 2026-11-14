import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { applyLang } from '../src/i18n';
import { FullscreenButton } from '../src/components/Fullscreen';
import { useImmersive } from '../src/immersive';
import { KeyHelp, TouchHelp } from '../src/components/ArcadeUI';

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

function setFullscreenEnabled(value: boolean | undefined) {
  Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => value });
}

beforeEach(() => {
  localStorage.clear();
  act(() => applyLang('hu'));
  mockPointer(false);
  setFullscreenEnabled(undefined);
  // jsdom has no scrolling; the exit test installs its own spy.
  Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: vi.fn() });
});
afterEach(() => {
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (document as { fullscreenEnabled?: unknown }).fullscreenEnabled;
  delete (document as { fullscreenElement?: unknown }).fullscreenElement;
  delete (document as { exitFullscreen?: unknown }).exitFullscreen;
  delete document.documentElement.dataset.arcadeImmersive;
  document.body.removeAttribute('style');
});

function Game() {
  const root = useRef<HTMLDivElement>(null);
  const immersive = useImmersive(root);
  return (
    <div ref={root} data-testid="game">
      <FullscreenButton immersive={immersive} />
      <span data-testid="state">{immersive.active ? 'on' : 'off'}</span>
    </div>
  );
}

const html = () => document.documentElement;

describe('useImmersive without the Fullscreen API (iPhone Safari)', () => {
  it('toggle sets html[data-arcade-immersive], the class and locks the body', () => {
    render(<Game />);
    const btn = screen.getByRole('button', { name: 'Teljes képernyő' });
    fireEvent.click(btn);
    expect(html().dataset.arcadeImmersive).toBe('1');
    expect(screen.getByTestId('game').classList.contains('arc-immersive')).toBe(true);
    expect(screen.getByTestId('state').textContent).toBe('on');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Kilépés' })).toBeTruthy();
  });

  it('exit restores scroll and chrome', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 250 });
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    document.body.style.overflow = 'auto';
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: 'Teljes képernyő' }));
    expect(document.body.style.top).toBe('-250px');
    fireEvent.click(screen.getByRole('button', { name: 'Kilépés' }));
    expect(html().dataset.arcadeImmersive).toBeUndefined();
    expect(screen.getByTestId('game').classList.contains('arc-immersive')).toBe(false);
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.overflow).toBe('auto');
    expect(scrollTo).toHaveBeenCalledWith(0, 250);
    expect(screen.getByTestId('state').textContent).toBe('off');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('Escape exits', () => {
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: 'Teljes képernyő' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(html().dataset.arcadeImmersive).toBeUndefined();
    expect(screen.getByTestId('state').textContent).toBe('off');
  });

  it('unmounting while immersive releases the lock', () => {
    const { unmount } = render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: 'Teljes képernyő' }));
    unmount();
    expect(html().dataset.arcadeImmersive).toBeUndefined();
    expect(document.body.style.position).toBe('');
  });

  it('labels follow the language', () => {
    act(() => applyLang('de'));
    render(<Game />);
    fireEvent.click(screen.getByRole('button', { name: 'Vollbild' }));
    expect(screen.getByRole('button', { name: 'Vollbild beenden' })).toBeTruthy();
    act(() => applyLang('en'));
    expect(screen.getByRole('button', { name: 'Exit full screen' })).toBeTruthy();
  });
});

describe('useImmersive with the Fullscreen API', () => {
  it('calls requestFullscreen on the target and follows fullscreenchange', async () => {
    setFullscreenEnabled(true);
    const request = vi.fn(() => Promise.resolve());
    const exit = vi.fn(() => Promise.resolve());
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, writable: true, value: request });
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, writable: true, value: exit });
    render(<Game />);
    const game = screen.getByTestId('game');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Teljes képernyő' }));
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.contexts[0]).toBe(game);
    expect(html().dataset.arcadeImmersive).toBeUndefined();

    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => game });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(screen.getByTestId('state').textContent).toBe('on');
    fireEvent.click(screen.getByRole('button', { name: 'Kilépés' }));
    expect(exit).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(screen.getByTestId('state').textContent).toBe('off');
    delete (HTMLElement.prototype as { requestFullscreen?: unknown }).requestFullscreen;
  });

  it('falls back to immersive mode when requestFullscreen is refused', async () => {
    setFullscreenEnabled(true);
    const request = vi.fn(() => Promise.reject(new Error('denied')));
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, writable: true, value: request });
    render(<Game />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Teljes képernyő' }));
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(html().dataset.arcadeImmersive).toBe('1');
    delete (HTMLElement.prototype as { requestFullscreen?: unknown }).requestFullscreen;
  });
});

describe('KeyHelp / TouchHelp', () => {
  const keys: [string, string][] = [['← →', 'Move']];
  const gestures: [string, string][] = [['Swipe', 'Turn']];

  it('fine pointer: KeyHelp shown, TouchHelp hidden', () => {
    render(
      <>
        <KeyHelp rows={keys} />
        <TouchHelp rows={gestures} />
      </>,
    );
    expect(screen.getByText('Move')).toBeTruthy();
    expect(screen.queryByText('Turn')).toBeNull();
  });

  it('KeyHelp hidden and TouchHelp shown under coarse pointer', () => {
    mockPointer(true);
    render(
      <>
        <KeyHelp rows={keys} heading />
        <TouchHelp rows={gestures} />
      </>,
    );
    expect(screen.queryByText('Move')).toBeNull();
    expect(screen.getByText('Turn')).toBeTruthy();
    expect(screen.getByText('Swipe')).toBeTruthy();
  });
});
