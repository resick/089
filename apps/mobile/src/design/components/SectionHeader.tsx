import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
};

export function SectionHeader({ title, subtitle, action }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="title2" accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text variant="footnote" color="textSecondary">
            {subtitle}
          </Text>
        )}
      </View>
      {action && <Button label={action.label} onPress={action.onPress} variant="ghost" />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: t.space.sm },
  text: { flex: 1, gap: t.space.xxs },
}));
