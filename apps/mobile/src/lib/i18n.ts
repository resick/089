import { resolveLocale, SUPPORTED_LOCALES } from '@089/core';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/locales/de.json';
import en from '@/locales/en.json';

export const resources = { de: { translation: de }, en: { translation: en } } as const;

const i18n = createInstance();

// Synchronous init: resources are bundled, so the first render already has strings.
void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLocale(getLocales().map((locale) => locale.languageTag)),
  fallbackLng: 'de',
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;
