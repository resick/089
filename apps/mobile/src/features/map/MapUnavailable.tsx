import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/design/theme';

/** Shown where the native map can't run (web preview, Expo Go). */
export function MapUnavailable({ message }: { message: string }) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
