import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Text } from './Text';

type Props = {
  /** Source credits, e.g. ["© OpenStreetMap contributors", "Photo: Name / CC BY 4.0"]. */
  credits: readonly string[];
  /** Date the info was last checked, pre-formatted. */
  lastVerified?: string;
};

/** Required source attribution under place/event content (DATA_SOURCES.md). */
export function AttributionFooter({ credits, lastVerified }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      {lastVerified && (
        <Text variant="footnote" color="textSecondary">
          {t('attribution.lastVerified', { date: lastVerified })}
        </Text>
      )}
      <Text variant="footnote" color="textTertiary">
        {t('attribution.sources', { sources: credits.join(' · ') })}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.xxs, paddingVertical: t.space.sm },
}));
