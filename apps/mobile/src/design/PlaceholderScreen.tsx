import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from './components/Text';
import { makeStyles } from './theme';

type Props = {
  title: string;
  /** Roadmap slice that builds this screen (docs/ROADMAP.md). */
  slice: number;
  children?: ReactNode;
};

/** Scaffold-only stand-in for screens that later slices build. */
export function PlaceholderScreen({ title, slice, children }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text variant="title1" accessibilityRole="header" align="center">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center">
        {t('placeholder.comingInSlice', { slice })}
      </Text>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.space.md,
    gap: t.space.xs,
    backgroundColor: t.colors.bg,
  },
}));
