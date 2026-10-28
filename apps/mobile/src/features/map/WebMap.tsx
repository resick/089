import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/design/theme';

import { MUNICH_CENTER } from './constants';
import { buildMapHtml } from './mapHtml';
import { useMapStyle } from './useMapStyle';

/**
 * MapLibre GL JS in a WebView, for Expo Go where the native module is
 * missing (ADR-028). Same tiles and style as the native map.
 */
export function WebMap() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styleUrl = useMapStyle();
  const html = useMemo(
    () =>
      buildMapHtml({ styleUrl, center: MUNICH_CENTER, zoom: 12.5, background: theme.colors.bg }),
    [styleUrl, theme.colors.bg],
  );
  return (
    <WebView
      source={{ html }}
      originWhitelist={['*']}
      style={[styles.map, { backgroundColor: theme.colors.bg }]}
      accessibilityLabel={t('map.a11yLabel')}
      // The map handles its own gestures; the page itself must not bounce.
      bounces={false}
      scrollEnabled={false}
      overScrollMode="never"
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
