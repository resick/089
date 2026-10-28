import { Text } from 'react-native';

import { fontFamily, useTheme } from '../theme';

const sizes = { md: 28, lg: 44 } as const;

/** Placeholder "089" wordmark until the real logo exists (DESIGN_SYSTEM §9). */
export function Wordmark({ size = 'md' }: { size?: keyof typeof sizes }) {
  const theme = useTheme();
  const fontSize = sizes[size];
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel="089"
      maxFontSizeMultiplier={1}
      style={{
        fontFamily: fontFamily[800],
        fontSize,
        lineHeight: fontSize * 1.1,
        letterSpacing: -fontSize * 0.05,
        color: theme.colors.accentText,
      }}
    >
      089
    </Text>
  );
}
