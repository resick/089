import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/design/components';
import { PlaceholderScreen } from '@/design/PlaceholderScreen';
import { env } from '@/lib/env';

export default function ExploreScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen title={t('tabs.explore')} slice={9}>
      {env.EXPO_PUBLIC_APP_ENV !== 'production' && (
        <Button
          label={t('gallery.open')}
          variant="secondary"
          onPress={() => router.push('/gallery')}
        />
      )}
    </PlaceholderScreen>
  );
}
