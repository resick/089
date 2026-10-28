import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Text } from './Text';

const sizes = { sm: 32, md: 44 } as const;

type Props = {
  name: string;
  size?: keyof typeof sizes;
};

/** Initials avatar; photo avatars arrive with profiles in Phase 2. */
export function Avatar({ name, size = 'md' }: Props) {
  const styles = useStyles();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const dimension = sizes[size];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.circle, { width: dimension, height: dimension }]}
    >
      <Text variant={size === 'sm' ? 'caption' : 'callout'} color="text">
        {initials}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  circle: {
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surfaceRaised,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
