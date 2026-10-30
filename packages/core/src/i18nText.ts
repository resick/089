import { z } from 'zod';

import { SUPPORTED_LOCALES, type Locale } from './locale';

/**
 * Translatable content as the database stores it: `{"de": "…", "en": "…"}`
 * (DATABASE §1.3). Unknown locale keys are tolerated, so content in a locale
 * added later doesn't break older app versions; at least one supported locale
 * must be present.
 */
export const i18nTextSchema = z
  .record(z.string(), z.string().min(1))
  .refine((text) => SUPPORTED_LOCALES.some((locale) => text[locale] !== undefined), {
    message: `needs text in at least one of: ${SUPPORTED_LOCALES.join(', ')}`,
  });
export type I18nText = z.infer<typeof i18nTextSchema>;

/** The text in `locale`, else in the first supported locale that has it. */
export function pickLocale(text: I18nText, locale: Locale): string {
  return (
    text[locale] ??
    SUPPORTED_LOCALES.map((fallback) => text[fallback]).find((value) => value !== undefined) ??
    ''
  );
}
