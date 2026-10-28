import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/design/theme';

// MapLibre React Native has no web renderer. The web app gets its own map
// (maplibre-gl) if and when the public web pages need one.
export function CityMap() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{t('map.webUnavailable')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
