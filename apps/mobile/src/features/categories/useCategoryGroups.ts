import { isLocale, DEFAULT_LOCALE, type Locale } from '@089/core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { fetchCategoryGroups } from './categories';

const ONE_DAY = 24 * 60 * 60 * 1000;

/** The category taxonomy. It changes rarely, so it is refetched at most daily. */
export function useCategoryGroups() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => fetchCategoryGroups(signal),
    staleTime: ONE_DAY,
    retry: 1,
  });
}

/** The UI locale, for picking from translatable database content. */
export function useContentLocale(): Locale {
  const { i18n } = useTranslation();
  return isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
}
