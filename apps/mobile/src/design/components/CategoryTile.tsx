import type { CategoryColorToken } from '@089/tokens';
import { View } from 'react-native';

import { categoryIcons } from '../categories';
import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Props = {
  category: CategoryColorToken;
  label: string;
  /** What's inside, e.g. "Restaurants · Cafés · Specialty coffee". */
  subtitle?: string;
  onPress: () => void;
};

/** Entry into a top-level category, used in Explore's category grid. */
export function CategoryTile({ category, label, subtitle, onPress }: Props) {
  const styles = useStyles();
  return (
    <PressableArea
      onPress={onPress}
      accessibilityLabel={subtitle ? `${label}: ${subtitle}` : label}
      style={styles.tile}
    >
      {/* Monochrome icon well (ADR-033): category colours stay on map pins. */}
      <View style={styles.badge}>
        <Icon icon={categoryIcons[category]} size="md" color="text" />
      </View>
      <View style={styles.text}>
        <Text variant="callout" numberOfLines={2}>
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  tile: {
    flex: 1,
    // Room for the subtitle from the start, so tiles don't grow once it loads.
    minHeight: 128,
    padding: t.space.md,
    gap: t.space.xs,
    borderRadius: t.radius.md,
    borderCurve: 'continuous',
    backgroundColor: t.colors.surface,
    justifyContent: 'space-between',
  },
  text: { gap: t.space.xxs },
  badge: {
    width: 40,
    height: 40,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
