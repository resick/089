import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

/** Quiet banner above cached content while offline (APP_STRUCTURE §2). */
export function OfflineBanner({ cachedAt }: { cachedAt?: string }) {
  const { t } = useTranslation();
  const styles = useStyles();
  const text = cachedAt ? t('offline.bannerWithTime', { time: cachedAt }) : t('offline.banner');
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon icon={WifiOff} size="sm" color="textSecondary" />
      <Text variant="footnote" color="textSecondary" style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xs,
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.xs,
    backgroundColor: t.colors.surface,
  },
  text: { flex: 1 },
}));
