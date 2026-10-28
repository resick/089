import { MIN_TOUCH_TARGET } from '@089/tokens';
import { Switch, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Text } from './Text';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** Labelled switch row, e.g. privacy and notification settings. */
export function Toggle({ label, description, value, onValueChange, disabled }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="body">{label}</Text>
        {description && (
          <Text variant="footnote" color="textSecondary">
            {description}
          </Text>
        )}
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityHint={description}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
        // A dark thumb disappears on the dark "off" track, so dark mode uses the text colour.
        thumbColor={theme.scheme === 'dark' ? theme.colors.text : theme.colors.surfaceRaised}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: t.space.xs,
  },
  text: { flex: 1, gap: t.space.xxs },
}));
