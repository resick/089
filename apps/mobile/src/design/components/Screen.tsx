import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles } from '../theme';

type Props = {
  children: ReactNode;
  /** Fixed content above the scroll area (e.g. a search field). */
  header?: ReactNode;
  scroll?: boolean;
};

/** Standard screen frame: safe area, background, gutter and section rhythm. */
export function Screen({ children, header, scroll = true }: Props) {
  const styles = useStyles();
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      {header && <View style={styles.header}>{header}</View>}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.bg },
  header: { paddingHorizontal: t.space.md, paddingTop: t.space.xs, paddingBottom: t.space.sm },
  content: {
    paddingHorizontal: t.space.md,
    paddingTop: t.space.md,
    paddingBottom: t.space.xxxl,
    gap: t.space.xxl,
  },
  fill: { flex: 1 },
}));
