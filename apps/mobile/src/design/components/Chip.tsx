import type { CategoryColorToken } from '@089/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { categoryIcons } from '../categories';
import { makeStyles } from '../theme';
import { GlassView } from './GlassView';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  /** Category chips show the category icon (monochrome since ADR-033). */
  category?: CategoryColorToken;
  /** Floating over the map: frosted glass instead of a solid surface. */
  glass?: boolean;
};

/** Filter/selection chip. Static (no onPress) chips render as labels. */
export function Chip({ label, selected = false, onPress, icon, category, glass = false }: Props) {
  const styles = useStyles();
  const glyph = category ? categoryIcons[category] : icon;
  // On the gold selected fill everything switches to onAccent for contrast.
  const fg = selected ? ('onAccent' as const) : ('text' as const);

  const content = (
    <>
      {glyph && <Icon icon={glyph} size="sm" color={fg} />}
      <Text variant="caption" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </>
  );
  const body =
    glass && !selected ? (
      <GlassView style={[styles.chip, styles.glass]}>{content}</GlassView>
    ) : (
      <View style={[styles.chip, selected && styles.selected]}>{content}</View>
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
    minHeight: 34,
    paddingHorizontal: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.fill,
    borderWidth: t.hairline,
    borderColor: t.colors.fill,
    alignSelf: 'flex-start',
  },
  glass: { borderColor: t.colors.border },
  selected: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
}));
