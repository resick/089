import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useColors } from '@/design/theme';
import { isExpoGo } from '@/lib/runtime';

import { MapUnavailable } from './MapUnavailable';

// Loaded lazily so the MapLibre native module is never touched in Expo Go,
// where it doesn't exist and would crash the app on import.
const NativeCityMap = lazy(() => import('./NativeCityMap'));

export function CityMap() {
  const { t } = useTranslation();
  const colors = useColors();

  if (isExpoGo) return <MapUnavailable message={t('map.expoGoUnavailable')} />;

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: colors.bg }} />}>
      <NativeCityMap />
    </Suspense>
  );
}
