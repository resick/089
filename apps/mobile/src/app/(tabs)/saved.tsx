import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/design/PlaceholderScreen';

export default function SavedScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('tabs.saved')} slice={11} />;
}
