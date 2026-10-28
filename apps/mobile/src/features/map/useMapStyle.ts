import { useTheme } from '@/design/theme';
import { env } from '@/lib/env';

/** Basemap style URL matching the current colour scheme. */
export function useMapStyle(): string {
  return useTheme().scheme === 'light'
    ? env.EXPO_PUBLIC_MAP_STYLE_URL_LIGHT
    : env.EXPO_PUBLIC_MAP_STYLE_URL;
}
