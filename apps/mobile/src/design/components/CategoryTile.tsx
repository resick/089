import type { CategoryColorToken } from '@089/tokens';
import { View } from 'react-native';

import { categoryIcons } from '../categories';
import { makeStyles, useTheme } from '../theme';
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
  const theme = useTheme();
  const tint = theme.category(category);
  return (
    <PressableArea
      onPress={onPress}
      accessibilityLabel={subtitle ? `${label}: ${subtitle}` : label}
      style={styles.tile}
    >
      <View style={[styles.badge, { backgroundColor: tint }]}>
        {/* bg is near-black in dark mode and white in light mode: the pin-glyph pairs from DESIGN_SYSTEM §1. */}
        <Icon icon={categoryIcons[category]} size="md" color="bg" />
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
    padding: t.space.sm,
    gap: t.space.xs,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    justifyContent: 'space-between',
  },
  text: { gap: t.space.xxs },
  badge: {
    width: 36,
    height: 36,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
