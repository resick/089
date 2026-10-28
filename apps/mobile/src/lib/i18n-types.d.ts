import 'i18next';

import type de from '@/locales/de.json';

// German is the source locale: keys missing from de.json are type errors.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof de };
  }
}
