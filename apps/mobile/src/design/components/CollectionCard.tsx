import type { CategoryColorToken } from '@089/tokens';
import { useTranslation } from 'react-i18next';
import { View, type ImageSourcePropType } from 'react-native';

import { makeStyles } from '../theme';
import { PlaceArt } from './PlaceArt';
import { PressableArea } from './PressableArea';
import { SponsoredLabel } from './SponsoredLabel';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  itemCount: number;
  /** Category whose tint fills the cover when there is no photo. */
  category: CategoryColorToken;
  cover?: ImageSourcePropType;
  /** Sponsored collections must carry the "Anzeige / Sponsored" label (UWG §5a). */
  sponsorName?: string;
  onPress: () => void;
};

export function CollectionCard({
  title,
  subtitle,
  itemCount,
  category,
  cover,
  sponsorName,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  const count = t('collection.items', { count: itemCount });
  const label = [sponsorName ? t('sponsored.label') : null, title, subtitle, count]
    .filter(Boolean)
    .join(', ');

  return (
    <PressableArea onPress={onPress} accessibilityLabel={label} style={styles.card}>
      <PlaceArt category={category} photo={cover} aspectRatio={16 / 10} />
      <View style={styles.body}>
        {sponsorName && <SponsoredLabel sponsorName={sponsorName} />}
        <Text variant="title3" numberOfLines={2}>
          {title}
        </Text>
        <Text variant="footnote" color="textSecondary" numberOfLines={1}>
          {[subtitle, count].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  card: { width: 280 },
  body: { paddingTop: t.space.sm, gap: t.space.xxs },
}));
