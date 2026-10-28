import { MAX_FONT_SCALE, type ColorToken, type TypeVariant } from '@089/tokens';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fontFamily, useTheme } from '../theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorToken;
  align?: 'auto' | 'left' | 'center' | 'right';
};

/** The only way to render text: type scale + colour tokens + dynamic type cap. */
export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { fontWeight, ...metrics } = theme.type[variant];
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        metrics,
        { fontFamily: fontFamily[fontWeight], color: theme.colors[color], textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
