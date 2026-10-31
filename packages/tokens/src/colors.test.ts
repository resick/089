import { describe, expect, it } from 'vitest';

import { categoryColors, mapPalette, palette, type ColorScheme } from './colors';
import { contrastRatio } from './contrast';

const schemes: ColorScheme[] = ['dark', 'light'];
const TEXT_MIN = 4.5;
const NON_TEXT_MIN = 3;
const TEXT_TOKENS = [
  'text',
  'textSecondary',
  'textTertiary',
  'accentText',
  'danger',
  'success',
] as const;

describe('palette contrast (WCAG AA)', () => {
  it.each(schemes)('%s: text tokens pass on bg and surface', (scheme) => {
    const p = palette[scheme];
    for (const token of TEXT_TOKENS) {
      expect(contrastRatio(p[token], p.bg), `${token} on bg`).toBeGreaterThanOrEqual(TEXT_MIN);
      expect(contrastRatio(p[token], p.surface), `${token} on surface`).toBeGreaterThanOrEqual(
        TEXT_MIN,
      );
    }
    expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it.each(schemes)('%s: category colours are visible against bg', (scheme) => {
    for (const [name, color] of Object.entries(categoryColors)) {
      expect(contrastRatio(color[scheme], palette[scheme].bg), name).toBeGreaterThanOrEqual(
        NON_TEXT_MIN,
      );
    }
  });
});

describe('contrastRatio', () => {
  it('matches known reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('#FFF', '#000000')).toThrow(/#RRGGBB/);
  });
});

describe('map palette', () => {
  it.each(schemes)('%s: labels stay legible on land', (scheme) => {
    const m = mapPalette[scheme];
    expect(contrastRatio(m.label, m.land)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrastRatio(m.labelStrong, m.land)).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});
