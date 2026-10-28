import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design/theme';

import { MUNICH_CENTER } from './constants';
import { buildMapHtml } from './mapHtml';
import { useMapStyle } from './useMapStyle';

// Web preview: the same MapLibre GL JS page as Expo Go, in an iframe.
export function CityMap() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styleUrl = useMapStyle();
  const html = useMemo(
    () =>
      buildMapHtml({ styleUrl, center: MUNICH_CENTER, zoom: 12.5, background: theme.colors.bg }),
    [styleUrl, theme.colors.bg],
  );
  return (
    <iframe
      title={t('map.a11yLabel')}
      srcDoc={html}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        border: 0,
        backgroundColor: theme.colors.bg,
      }}
    />
  );
}
