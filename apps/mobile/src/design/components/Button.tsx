import { MIN_TOUCH_TARGET } from '@089/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { fontFamily, makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityHint,
}: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const fg = {
    primary: 'onAccent',
    secondary: 'text',
    ghost: 'accentText',
    destructive: 'danger',
  } as const;

  return (
    <PressableArea
      // Loading blocks presses but keeps full strength: only `disabled` dims.
      onPress={loading ? undefined : onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[styles.base, styles[variant], size === 'lg' && styles.lg, fullWidth && styles.full]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors[fg[variant]]} />
        ) : (
          icon && <Icon icon={icon} size="md" color={fg[variant]} />
        )}
        <Text variant="callout" color={fg[variant]} style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.full,
    justifyContent: 'center',
  },
  lg: { minHeight: MIN_TOUCH_TARGET + t.space.xs, paddingHorizontal: t.space.xl },
  full: { alignSelf: 'stretch' },
  primary: { backgroundColor: t.colors.accent },
  secondary: {
    backgroundColor: t.colors.surface,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
  },
  ghost: { backgroundColor: 'transparent', paddingHorizontal: t.space.xs },
  destructive: {
    backgroundColor: 'transparent',
    borderWidth: t.hairline,
    borderColor: t.colors.danger,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.xs,
  },
  label: { fontFamily: fontFamily[600] },
}));
