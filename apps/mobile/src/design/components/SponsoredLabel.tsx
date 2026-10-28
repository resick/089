import { useTranslation } from 'react-i18next';

import { Text } from './Text';

/** Mandatory paid-placement label ("Anzeige" / "Sponsored"), always visible. */
export function SponsoredLabel({ sponsorName }: { sponsorName: string }) {
  const { t } = useTranslation();
  return (
    <Text variant="caption" color="textSecondary" numberOfLines={1}>
      {t('sponsored.withSponsor', { sponsor: sponsorName })}
    </Text>
  );
}
