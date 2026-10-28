import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('matches on the language subtag', () => {
    expect(resolveLocale(['en-GB'])).toBe('en');
    expect(resolveLocale(['de-AT', 'en-US'])).toBe('de');
  });

  it('skips unsupported languages in order of preference', () => {
    expect(resolveLocale(['fr-FR', 'en-US'])).toBe('en');
  });

  it('falls back to German', () => {
    expect(resolveLocale([])).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(['it-IT'])).toBe('de');
  });
});
