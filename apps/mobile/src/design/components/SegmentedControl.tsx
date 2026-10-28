import { View } from 'react-native';

import { makeStyles } from '../theme';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  const styles = useStyles();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableArea
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            haptic="selection"
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text variant="callout" color={selected ? 'text' : 'textSecondary'} align="center">
              {option.label}
            </Text>
          </PressableArea>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    flexDirection: 'row',
    padding: t.space.xxs,
    gap: t.space.xxs,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surface,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: t.radius.full,
  },
  selected: { backgroundColor: t.colors.bg },
}));
