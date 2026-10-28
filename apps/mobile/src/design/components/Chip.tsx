import type { CategoryColorToken } from '@089/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { categoryIcons } from '../categories';
import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  /** Category chips show the category icon in its colour (DESIGN_SYSTEM §1). */
  category?: CategoryColorToken;
};

/** Filter/selection chip. Static (no onPress) chips render as labels. */
export function Chip({ label, selected = false, onPress, icon, category }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const glyph = category ? categoryIcons[category] : icon;
  // On the gold selected fill everything switches to onAccent for contrast.
  const glyphColor = selected
    ? ('onAccent' as const)
    : category
      ? { raw: theme.category(category) }
      : ('textSecondary' as const);

  const body = (
    <View style={[styles.chip, selected && styles.selected]}>
      {glyph && <Icon icon={glyph} size="sm" color={glyphColor} />}
      <Text variant="caption" color={selected ? 'onAccent' : 'text'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return body;
  return (
    <PressableArea
      onPress={onPress}
      haptic="selection"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      {body}
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xxs,
    minHeight: 32,
    paddingHorizontal: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surface,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
    alignSelf: 'flex-start',
  },
  selected: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
}));
