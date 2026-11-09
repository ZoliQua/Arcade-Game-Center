import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { applyDental } from '../src/dental';
import { applyLang } from '../src/i18n';
import { ArcadeShell } from '../src/components/ArcadeShell';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
});
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

const here = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

describe('ArcadeShell URL hand-off cleanup', () => {
  it('applies ?lang= / ?dental= and then removes them from the address bar', () => {
    window.history.replaceState(null, '', '/Snake-Game/?x=2&lang=de&dental=1#/a?lang=hu');
    render(
      <ArcadeShell gameId="snake">
        <p>board</p>
      </ArcadeShell>,
    );
    expect(document.documentElement.lang).toBe('hu');
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(here()).toBe('/Snake-Game/?x=2#/a');
  });

  it('leaves a clean URL alone', () => {
    window.history.replaceState(null, '', '/Snake-Game/?x=2');
    const spy = vi.spyOn(window.history, 'replaceState');
    render(
      <ArcadeShell gameId="snake">
        <p>board</p>
      </ArcadeShell>,
    );
    expect(spy).not.toHaveBeenCalled();
    expect(here()).toBe('/Snake-Game/?x=2');
  });
});

/** Stands in for a game: pauses on Escape via a window keydown listener. */
function FakeGame({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEsc();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEsc]);
  return <p>board</p>;
}

describe('ArcadeShell language menu', () => {
  it('is a plain list of pressed/unpressed buttons', () => {
    render(
      <ArcadeShell gameId="snake">
        <p>board</p>
      </ArcadeShell>,
    );
    const trigger = screen.getByRole('button', { name: /Language/ });
    expect(trigger.getAttribute('aria-haspopup')).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByRole('menuitemradio')).toBeNull();
    const list = screen.getByRole('list', { name: 'Language' });
    expect(within(list).getByRole('button', { name: /English/ }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(within(list).getByRole('button', { name: /Deutsch/ }));
    expect(document.documentElement.lang).toBe('de');
    expect(screen.queryByRole('list', { name: 'Sprache' })).toBeNull();
  });

  it('Escape closes the open menu without reaching the game, and refocuses the trigger', () => {
    const onEsc = vi.fn();
    render(
      <ArcadeShell gameId="snake">
        <FakeGame onEsc={onEsc} />
      </ArcadeShell>,
    );
    const trigger = screen.getByRole('button', { name: /Language/ });
    fireEvent.click(trigger);
    const item = screen.getByRole('button', { name: /Magyar/ });
    item.focus();
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(onEsc).not.toHaveBeenCalled();
    expect(screen.queryByRole('list', { name: 'Language' })).toBeNull();
    expect(document.activeElement).toBe(trigger);

    // Closed again: Escape belongs to the game.
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onEsc).toHaveBeenCalledTimes(1);
  });

  it('Escape with focus outside the menu still only closes it', () => {
    const onEsc = vi.fn();
    render(
      <ArcadeShell gameId="snake">
        <FakeGame onEsc={onEsc} />
      </ArcadeShell>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Language/ }));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onEsc).not.toHaveBeenCalled();
    expect(screen.queryByRole('list', { name: 'Language' })).toBeNull();
  });
});
