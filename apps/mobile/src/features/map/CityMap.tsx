import { lazy, Suspense } from 'react';
import { View } from 'react-native';

import { useColors } from '@/design/theme';
import { isExpoGo } from '@/lib/runtime';

import { WebMap } from './WebMap';

// Loaded lazily so the MapLibre native module is never touched in Expo Go,
// where it doesn't exist and would crash the app on import.
const NativeCityMap = lazy(() => import('./NativeCityMap'));

export function CityMap() {
  const colors = useColors();

  // Expo Go: same map through MapLibre GL JS in a WebView (ADR-028).
  if (isExpoGo) return <WebMap />;

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: colors.bg }} />}>
      <NativeCityMap />
    </Suspense>
  );
}
