import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '../theme';

type Props = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Frosted surface for controls floating over the map, like Apple Maps
 * (ADR-033). Only for floating controls: content surfaces stay solid.
 * Android renders the translucent `glass` colour without a blur (expo-blur's
 * default), which keeps text legible over the map.
 */
export function GlassView({ style, children }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <BlurView
      intensity={80}
      tint={theme.scheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
      style={[styles.glass, style]}
    >
      {children}
    </BlurView>
  );
}

const useStyles = makeStyles((t) => ({
  // overflow: iOS only clips the blur to rounded corners with it.
  glass: { backgroundColor: t.colors.glass, overflow: 'hidden' },
}));
