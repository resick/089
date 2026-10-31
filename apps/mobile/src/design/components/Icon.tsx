import type { ColorToken } from '@089/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '../theme';

/** Thin, even strokes in the spirit of SF Symbols (ADR-033). */
export const ICON_STROKE = 1.75;

export const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const;
export type IconSize = keyof typeof iconSizes;

type Props = {
  icon: LucideIcon;
  size?: IconSize;
  /** A colour token, or a raw value only for category colours from the theme. */
  color?: ColorToken | { raw: string };
  /** Give a label only when the icon carries meaning on its own. */
  accessibilityLabel?: string;
};

export function Icon({ icon: Glyph, size = 'md', color = 'text', accessibilityLabel }: Props) {
  const theme = useTheme();
  const resolved = typeof color === 'string' ? theme.colors[color] : color.raw;
  const decorative = !accessibilityLabel;
  // Accessibility props live on a View, not the SVG: react-native-web only
  // translates them for Views, and would leak them as invalid DOM attributes.
  return (
    <View
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    >
      <Glyph size={iconSizes[size]} color={resolved} strokeWidth={ICON_STROKE} />
    </View>
  );
}
