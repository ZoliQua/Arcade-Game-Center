import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Gallery } from './Gallery';

describe('Gallery', () => {
  it('shows all 32 faces plus the classic and the dental back', () => {
    const { container } = render(<Gallery />);
    expect(container.querySelectorAll('svg[data-card]')).toHaveLength(32);
    expect(container.querySelectorAll('svg[data-back]')).toHaveLength(2);
    expect(screen.getByTestId('hcard-back-tooth')).toBeTruthy();
    expect(screen.getByTestId('hcard-back-classic')).toBeTruthy();
  });

  it('captions name the Tell figure, the mounted king and the season', () => {
    render(<Gallery />);
    expect(screen.getByText('Over of Makk · William Tell')).toBeTruthy();
    expect(screen.getByText('King of Piros · mounted king')).toBeTruthy();
    expect(screen.getByText('Ace of Makk · Winter')).toBeTruthy();
    expect(screen.getByText('Seven of Zöld', { selector: 'figcaption' })).toBeTruthy();
  });
});
