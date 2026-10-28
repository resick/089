import { router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState, Screen, Text } from '@/design/components';

export function SavedScreen() {
  const { t } = useTranslation();
  return (
    <Screen
      header={
        <Text variant="title1" accessibilityRole="header">
          {t('saved.title')}
        </Text>
      }
    >
      <EmptyState
        icon={Bookmark}
        title={t('saved.emptyTitle')}
        body={t('saved.emptyBody', { slice: 11 })}
        action={{ label: t('saved.browse'), onPress: () => router.navigate('/') }}
      />
    </Screen>
  );
}
