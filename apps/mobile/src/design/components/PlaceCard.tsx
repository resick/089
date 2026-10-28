import type { CategoryColorToken } from '@089/tokens';
import { View, type ImageSourcePropType } from 'react-native';

import { makeStyles } from '../theme';
import { PlaceArt } from './PlaceArt';
import { PressableArea } from './PressableArea';
import { SaveButton } from './SaveButton';
import { StatusLine, type OpenStatus } from './StatusLine';
import { Text } from './Text';

export type PlaceSummary = {
  name: string;
  category: CategoryColorToken;
  categoryLabel: string;
  /** e.g. "Schwabing · €€". */
  meta?: string;
  status?: { status: OpenStatus; text: string };
  /** Pre-formatted, e.g. "850 m". */
  distance?: string;
  photo?: ImageSourcePropType;
};

type Props = PlaceSummary & {
  /** L: full-width feature card. M: carousel card (fixed width). */
  size?: 'L' | 'M';
  saved?: boolean;
  onToggleSave?: () => void;
  onPress: () => void;
};

export const PLACE_CARD_M_WIDTH = 240;

export function PlaceCard({
  size = 'M',
  name,
  category,
  categoryLabel,
  meta,
  status,
  distance,
  photo,
  saved = false,
  onToggleSave,
  onPress,
}: Props) {
  const styles = useStyles();
  const subtitle = [categoryLabel, meta].filter(Boolean).join(' · ');
  const label = [name, subtitle, status?.text, distance].filter(Boolean).join(', ');

  // The save button is a sibling of the card's pressable, not a child: nested
  // buttons are invalid on web and unreachable for screen readers.
  return (
    <View style={size === 'M' ? styles.cardM : styles.cardL}>
      <PressableArea onPress={onPress} accessibilityLabel={label}>
        <PlaceArt category={category} photo={photo} aspectRatio={size === 'M' ? 4 / 5 : 4 / 3} />
        <View style={styles.body}>
          <Text variant={size === 'L' ? 'title3' : 'bodyStrong'} numberOfLines={2}>
            {name}
          </Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>
            {subtitle}
            {distance ? ` · ${distance}` : ''}
          </Text>
          {status && <StatusLine status={status.status} text={status.text} />}
        </View>
      </PressableArea>
      {onToggleSave && (
        <View style={styles.save}>
          <SaveButton saved={saved} onToggle={onToggleSave} />
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  cardM: { width: PLACE_CARD_M_WIDTH },
  cardL: { width: '100%' },
  save: { position: 'absolute', top: t.space.xs, right: t.space.xs },
  body: { paddingTop: t.space.sm, gap: t.space.xxs },
}));
