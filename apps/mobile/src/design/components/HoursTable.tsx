import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Text } from './Text';

export type HoursRow = {
  day: string;
  /** e.g. "11:00–23:00", "Closed", or two ranges joined with ", ". */
  hours: string;
  isToday?: boolean;
};

type Props = {
  rows: readonly HoursRow[];
  /** e.g. a public holiday note. */
  note?: string;
};

/** Weekly opening hours with today highlighted. Hours logic arrives in slice 6. */
export function HoursTable({ rows, note }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.table}>
      {rows.map((row) => (
        <View
          key={row.day}
          style={[styles.row, row.isToday && styles.today]}
          accessible
          accessibilityLabel={
            row.isToday
              ? t('hours.todayA11y', { day: row.day, hours: row.hours })
              : `${row.day}, ${row.hours}`
          }
        >
          <Text variant={row.isToday ? 'bodyStrong' : 'body'} style={styles.day}>
            {row.day}
          </Text>
          <Text
            variant={row.isToday ? 'bodyStrong' : 'body'}
            color={row.isToday ? 'text' : 'textSecondary'}
            style={styles.tabular}
          >
            {row.hours}
          </Text>
        </View>
      ))}
      {note && (
        <Text variant="footnote" color="textSecondary" style={styles.note}>
          {note}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  table: { gap: t.space.xxs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.space.md,
    paddingVertical: t.space.xxs,
    paddingHorizontal: t.space.xs,
    borderRadius: t.radius.sm,
  },
  today: { backgroundColor: t.colors.surface },
  day: { flexShrink: 0 },
  tabular: { fontVariant: ['tabular-nums'], textAlign: 'right', flexShrink: 1 },
  note: { paddingHorizontal: t.space.xs, paddingTop: t.space.xxs },
}));
