import { useTranslation } from 'react-i18next';

import { MapUnavailable } from './MapUnavailable';

// MapLibre React Native has no web renderer. The web app gets its own map
// (maplibre-gl) if and when the public web pages need one.
export function CityMap() {
  const { t } = useTranslation();
  return <MapUnavailable message={t('map.webUnavailable')} />;
}
