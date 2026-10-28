import { Footprints } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type TransitMode = 'U' | 'S' | 'Tram' | 'Bus';

export type TransitStop = {
  name: string;
  modes: readonly TransitMode[];
  walkMinutes: number;
};

/** Nearest stops with walking time (MVV GTFS, slice 7). Credit shown below. */
export function TransitStops({ stops }: { stops: readonly TransitStop[] }) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {stops.map((stop) => (
        <View
          key={stop.name}
          style={styles.row}
          accessible
          accessibilityLabel={t('transit.a11y', {
            name: stop.name,
            modes: stop.modes.join(', '),
            minutes: stop.walkMinutes,
          })}
        >
          <View style={styles.modes}>
            {stop.modes.map((mode) => (
              <View key={mode} style={styles.mode}>
                <Text variant="caption">{mode}</Text>
              </View>
            ))}
          </View>
          <Text variant="body" style={styles.name} numberOfLines={1}>
            {stop.name}
          </Text>
          <Icon icon={Footprints} size="sm" color="textSecondary" />
          <Text variant="footnote" color="textSecondary">
            {t('transit.walkMinutes', { count: stop.walkMinutes })}
          </Text>
        </View>
      ))}
      <Text variant="footnote" color="textTertiary">
        {t('transit.credit')}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  list: { gap: t.space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  modes: { flexDirection: 'row', gap: t.space.xxs },
  mode: {
    minWidth: 28,
    paddingHorizontal: t.space.xxs,
    paddingVertical: 2,
    borderRadius: t.radius.sm,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
    alignItems: 'center',
  },
  name: { flex: 1 },
}));
