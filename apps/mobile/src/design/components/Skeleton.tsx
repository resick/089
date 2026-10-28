import type { RadiusToken } from '@089/tokens';
import { useEffect, useState } from 'react';
import { Animated, type DimensionValue } from 'react-native';

import { useReducedMotion } from '../motion';
import { useTheme } from '../theme';

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: RadiusToken;
};

/** Loading placeholder shaped like the content it stands in for. */
export function Skeleton({ width = '100%', height, radius = 'sm' }: Props) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduced]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width,
        height,
        borderRadius: theme.radius[radius],
        // In light mode surfaceRaised is white like bg, so step down to surface.
        backgroundColor:
          theme.scheme === 'light' ? theme.colors.surface : theme.colors.surfaceRaised,
        opacity,
      }}
    />
  );
}
