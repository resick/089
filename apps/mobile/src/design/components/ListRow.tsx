import { MIN_TOUCH_TARGET } from '@089/tokens';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Props = {
  label: string;
  value?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  destructive?: boolean;
};

/** Settings-style row. Shows a chevron when it navigates. */
export function ListRow({ label, value, icon, onPress, destructive }: Props) {
  const styles = useStyles();
  const content = (
    <View style={styles.row}>
      {icon && <Icon icon={icon} size="md" color={destructive ? 'danger' : 'textSecondary'} />}
      <Text variant="body" color={destructive ? 'danger' : 'text'} style={styles.label}>
        {label}
      </Text>
      {value && (
        <Text variant="body" color="textSecondary" numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && <Icon icon={ChevronRight} size="md" color="textTertiary" />}
    </View>
  );
  if (!onPress) return content;
  return (
    <PressableArea
      onPress={onPress}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityRole={destructive ? 'button' : 'link'}
    >
      {content}
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    minHeight: MIN_TOUCH_TARGET + t.space.xxs,
    paddingVertical: t.space.xs,
  },
  label: { flex: 1 },
}));
