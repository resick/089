import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from './IconButton';

/** Back navigation for screens without a native header. */
export function BackButton() {
  const { t } = useTranslation();
  return (
    <IconButton
      icon={ChevronLeft}
      accessibilityLabel={t('common.back')}
      variant="filled"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
