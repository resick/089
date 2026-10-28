import { ServerCrash, WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from './EmptyState';

type Props = {
  /** Offline and server errors get different wording: one is the user's network, one is ours. */
  kind: 'offline' | 'server';
  onRetry: () => void;
};

export function ErrorState({ kind, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={kind === 'offline' ? WifiOff : ServerCrash}
      title={t(`error.${kind}.title`)}
      body={t(`error.${kind}.body`)}
      action={{ label: t('error.retry'), onPress: onRetry }}
    />
  );
}
