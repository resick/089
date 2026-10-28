import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useColors } from './theme';

type Props = {
  title: string;
  /** Roadmap slice that builds this screen (docs/ROADMAP.md). */
  slice: number;
};

/** Scaffold-only stand-in for screens that later slices build. */
export function PlaceholderScreen({ title, slice }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {t('placeholder.comingInSlice', { slice })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
