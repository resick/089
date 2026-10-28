/** UI and content locales. German first: Munich is the launch city. */
export const SUPPORTED_LOCALES = ['de', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the first supported locale from a preference list such as
 * `["en-GB", "de-DE"]`, matching on the language subtag only.
 */
export function resolveLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const language = tag.split('-')[0]?.toLowerCase();
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}
