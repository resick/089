import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/design/theme';

import { MUNICH_CENTER } from './constants';
import { useMapStyle } from './useMapStyle';

/**
 * Native MapLibre map for dev/production builds. Clustering and pins come
 * with real places (slice 7).
 * Only import this through CityMap, which keeps it out of Expo Go.
 */
export default function NativeCityMap() {
  const { t } = useTranslation();
  const colors = useColors();
  const style = useMapStyle();
  if (!style) return <View style={[styles.map, { backgroundColor: colors.bg }]} />;
  return (
    <Map
      style={styles.map}
      // A JSON string is accepted as well as a URL.
      mapStyle={typeof style === 'string' ? style : JSON.stringify(style)}
      accessibilityLabel={t('map.a11yLabel')}
      // Attribution stays on: OSM data requires a visible credit (docs/DATA_SOURCES.md).
      attribution
      logo={false}
      tintColor={colors.text}
    >
      <Camera initialViewState={{ center: MUNICH_CENTER, zoom: 13 }} />
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
