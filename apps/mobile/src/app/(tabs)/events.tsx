import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/design/PlaceholderScreen';

export default function EventsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('tabs.events')} slice={10} />;
}
