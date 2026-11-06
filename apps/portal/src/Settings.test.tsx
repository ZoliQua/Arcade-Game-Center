import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyDental, applyLang } from '@arcade/kit';
import { Settings } from './Settings';

function renderSettings() {
  return render(<Settings theme="dark" setTheme={() => {}} nickname={null} onNicknameChange={() => {}} />);
}

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  localStorage.clear();
});

describe('Settings', () => {
  it('turns dental mode on and off', () => {
    renderSettings();
    const toggle = screen.getByRole('switch', { name: 'Dental mode' });
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(toggle);
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.getAttribute('data-dental')).toBe('on');
    fireEvent.click(toggle);
    expect(localStorage.getItem('arcade.dental')).toBe('0');
  });

  it('shows the dental description', () => {
    renderSettings();
    expect(screen.getByText('Teeth, toothbrushes and toothpaste in every game')).toBeTruthy();
  });

  it('switches language from the segmented control', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Magyar' }));
    expect(localStorage.getItem('arcade.lang')).toBe('hu');
    expect(screen.getByRole('heading', { name: 'Beállítások' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Fogas mód' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Magyar' }).getAttribute('aria-pressed')).toBe('true');
  });
});
