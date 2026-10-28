import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { useColors } from '@/design/theme';

import { MUNICH_CENTER } from './constants';
import { useMapStyle } from './useMapStyle';

/**
 * Native MapLibre map for dev/production builds. Clustering, filters and our
 * own basemap come in slice 7.
 * Only import this through CityMap, which keeps it out of Expo Go.
 */
export default function NativeCityMap() {
  const { t } = useTranslation();
  const colors = useColors();
  const mapStyle = useMapStyle();
  return (
    <Map
      style={styles.map}
      mapStyle={mapStyle}
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
