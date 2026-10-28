import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  icon: LucideIcon;
  title: string;
  /** One sentence: why it's empty and what to do. */
  body: string;
  action?: { label: string; onPress: () => void };
};

/** Designed empty state: one line icon, title, one sentence, one action. */
export function EmptyState({ icon, title, body, action }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Icon icon={icon} size="xl" color="textTertiary" />
      <Text variant="title3" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center">
        {body}
      </Text>
      {action && <Button label={action.label} onPress={action.onPress} variant="secondary" />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.sm,
    paddingHorizontal: t.space.xl,
    paddingVertical: t.space.xxl,
  },
}));
