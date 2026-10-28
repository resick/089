import type { ColorToken } from '@089/tokens';
import { View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Text } from './Text';

export type OpenStatus = 'open' | 'closesSoon' | 'closed' | 'unknown';

const statusColor: Record<OpenStatus, ColorToken> = {
  open: 'success',
  closesSoon: 'warning',
  closed: 'textSecondary',
  unknown: 'textTertiary',
};

type Props = {
  status: OpenStatus;
  /** Full sentence, e.g. "Open · closes 23:00". Computed by the caller (slice 6). */
  text: string;
};

/**
 * Open/closed line. The text always states the status, so colour is never
 * the only signal, and screen readers read it as one phrase.
 */
export function StatusLine({ status, text }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.row} accessible accessibilityLabel={text.replace(' · ', ', ')}>
      <View style={[styles.dot, { backgroundColor: theme.colors[statusColor[status]] }]} />
      <Text variant="callout" color={statusColor[status]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  dot: { width: 8, height: 8, borderRadius: t.radius.full },
}));
