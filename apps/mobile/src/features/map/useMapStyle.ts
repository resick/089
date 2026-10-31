import { mapPalette } from '@089/tokens';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useTheme } from '@/design/theme';
import { env } from '@/lib/env';

import { basemapStyleSchema, restyleBasemap, type BasemapStyle } from './basemapStyle';

/** Basemap style URL matching the current colour scheme. */
export function useMapStyleUrl(): string {
  return useTheme().scheme === 'light'
    ? env.EXPO_PUBLIC_MAP_STYLE_URL_LIGHT
    : env.EXPO_PUBLIC_MAP_STYLE_URL;
}

export async function fetchBasemapStyle(url: string, signal?: AbortSignal): Promise<BasemapStyle> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Basemap style responded ${response.status}`);
  return basemapStyleSchema.parse(await response.json());
}

/**
 * Our restyled basemap for the current scheme. `undefined` while it loads;
 * if the style can't be fetched, falls back to the stock style URL so the
 * map still renders.
 */
export function useMapStyle(): BasemapStyle | string | undefined {
  const theme = useTheme();
  const url = useMapStyleUrl();
  const query = useQuery({
    queryKey: ['basemap-style', url],
    queryFn: ({ signal }) => fetchBasemapStyle(url, signal),
    staleTime: Infinity,
    retry: 1,
  });
  // Stable identity matters: a new object would rebuild the WebView page.
  const restyled = useMemo(
    () => query.data && restyleBasemap(query.data, mapPalette[theme.scheme]),
    [query.data, theme.scheme],
  );
  return query.isError ? url : restyled;
}
