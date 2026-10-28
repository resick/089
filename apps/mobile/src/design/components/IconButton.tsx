import { MIN_TOUCH_TARGET } from '@089/tokens';
import type { LucideIcon } from 'lucide-react-native';

import type { HapticKind } from '../motion';
import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';

type Props = {
  icon: LucideIcon;
  /** Required: an icon-only button has no visible text for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  variant?: 'plain' | 'filled';
  selected?: boolean;
  haptic?: HapticKind;
  disabled?: boolean;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  selected,
  haptic,
  disabled,
}: Props) {
  const styles = useStyles();
  return (
    <PressableArea
      onPress={onPress}
      haptic={haptic}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, selected }}
      style={[styles.base, variant === 'filled' && styles.filled]}
    >
      <Icon icon={icon} size="md" color={selected ? 'accentText' : 'text'} />
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { backgroundColor: t.colors.surfaceRaised },
}));
