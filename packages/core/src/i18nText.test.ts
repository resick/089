import { describe, expect, it } from 'vitest';

import { i18nTextSchema, pickLocale } from './i18nText';

describe('i18nTextSchema', () => {
  it('accepts one or more supported locales', () => {
    expect(i18nTextSchema.parse({ de: 'Testort', en: 'Test place' })).toEqual({
      de: 'Testort',
      en: 'Test place',
    });
    expect(i18nTextSchema.safeParse({ en: 'Test place' }).success).toBe(true);
  });

  it('tolerates locales the app does not know yet', () => {
    expect(i18nTextSchema.safeParse({ de: 'Testort', fr: 'Lieu test' }).success).toBe(true);
  });

  it('rejects text without any supported locale, empty strings and non-objects', () => {
    expect(i18nTextSchema.safeParse({ fr: 'Lieu test' }).success).toBe(false);
    expect(i18nTextSchema.safeParse({ de: '' }).success).toBe(false);
    expect(i18nTextSchema.safeParse('Testort').success).toBe(false);
  });
});

describe('pickLocale', () => {
  it('returns the requested locale', () => {
    expect(pickLocale({ de: 'Testort', en: 'Test place' }, 'en')).toBe('Test place');
  });

  it('falls back to another supported locale', () => {
    expect(pickLocale({ de: 'Testort' }, 'en')).toBe('Testort');
    expect(pickLocale({ en: 'Test place', fr: 'Lieu test' }, 'de')).toBe('Test place');
  });
});
