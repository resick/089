import { MIN_TOUCH_TARGET } from '@089/tokens';
import { useState } from 'react';
import {
  Pressable,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { haptic, type HapticKind } from '../motion';

export type PressableAreaProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  haptic?: HapticKind;
};

/**
 * Pressable with the app's touch rules: the hit area is grown to at least
 * 44×44pt even when the visual is smaller, pressed state dims, optional haptic.
 */
export function PressableArea({
  style,
  onPress,
  haptic: kind,
  disabled,
  ...rest
}: PressableAreaProps) {
  const [size, setSize] = useState({ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET });
  const padX = Math.max(0, (MIN_TOUCH_TARGET - size.width) / 2);
  const padY = Math.max(0, (MIN_TOUCH_TARGET - size.height) / 2);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      // undefined (not false) so Pressable keeps a caller's accessibilityState.disabled,
      // e.g. a loading Button that blocks presses without dimming.
      disabled={disabled || undefined}
      hitSlop={{ top: padY, bottom: padY, left: padX, right: padX }}
      onLayout={(event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      onPress={(event) => {
        if (kind) haptic(kind);
        onPress?.(event);
      }}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && !disabled ? { opacity: 0.7 } : null,
        disabled ? { opacity: 0.4 } : null,
      ]}
      {...rest}
    />
  );
}
