import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '../theme';
import { Text } from './Text';

/**
 * Layout for content shown in a native sheet. Sheets themselves are Expo
 * Router screens with `presentation: 'formSheet'` (ADR-027), so they get
 * native gestures, detents and accessibility without extra libraries.
 */
export function SheetContent({ title, children }: { title?: string; children: ReactNode }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + styles.content.paddingTop },
      ]}
    >
      {title && (
        <Text variant="title2" accessibilityRole="header">
          {title}
        </Text>
      )}
      {children}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  content: { paddingHorizontal: t.space.md, paddingTop: t.space.xl, gap: t.space.md },
}));
