import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { useColors } from '@/design/theme';
import { env } from '@/lib/env';

import { MUNICH_CENTER } from './constants';

/**
 * Scaffold spike (slice 1): proves the native MapLibre module renders in a dev
 * build. Clustering, filters and our own basemap come in slice 7.
 */
export function CityMap() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Map
      style={styles.map}
      mapStyle={env.EXPO_PUBLIC_MAP_STYLE_URL}
      accessibilityLabel={t('map.a11yLabel')}
      // Attribution stays on: OSM data requires a visible credit (docs/DATA_SOURCES.md).
      attribution
      logo={false}
      tintColor={colors.accentText}
    >
      <Camera initialViewState={{ center: MUNICH_CENTER, zoom: 12 }} />
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
