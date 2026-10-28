import { describe, expect, it } from 'vitest';

import { space } from './layout';
import { typeScale } from './typography';

describe('type scale', () => {
  it('keeps every style readable: minimum 12pt and line height above font size', () => {
    for (const [name, style] of Object.entries(typeScale)) {
      expect(style.fontSize, name).toBeGreaterThanOrEqual(12);
      expect(style.lineHeight, name).toBeGreaterThan(style.fontSize);
    }
  });

  it('sits on the 2pt grid for line heights', () => {
    for (const [name, style] of Object.entries(typeScale)) {
      expect(style.lineHeight % 2, name).toBe(0);
    }
  });
});

describe('spacing', () => {
  it('uses only multiples of 4', () => {
    for (const [name, value] of Object.entries(space)) {
      expect(value % 4, name).toBe(0);
    }
  });

  it('increases strictly from step to step', () => {
    const values = Object.values(space);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });
});
