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
  onPress: () => void;
};

/** Entry into a top-level category, used in Explore's category grid. */
export function CategoryTile({ category, label, onPress }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const tint = theme.category(category);
  return (
    <PressableArea onPress={onPress} accessibilityLabel={label} style={styles.tile}>
      <View style={[styles.badge, { backgroundColor: tint }]}>
        {/* bg is near-black in dark mode and white in light mode: the pin-glyph pairs from DESIGN_SYSTEM §1. */}
        <Icon icon={categoryIcons[category]} size="md" color="bg" />
      </View>
      <Text variant="callout" numberOfLines={2}>
        {label}
      </Text>
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  tile: {
    flex: 1,
    minHeight: 88,
    padding: t.space.sm,
    gap: t.space.xs,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    justifyContent: 'space-between',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
