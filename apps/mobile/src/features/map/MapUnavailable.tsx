import { Map as MapIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon, Text } from '@/design/components';
import { makeStyles } from '@/design/theme';

/** Shown where the native map can't run (web preview, Expo Go). */
export function MapUnavailable({ message }: { message: string }) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Icon icon={MapIcon} size="xl" color="textTertiary" />
      <Text variant="body" color="textSecondary" align="center">
        {message}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.sm,
    padding: t.space.md,
    backgroundColor: t.colors.bg,
  },
}));
