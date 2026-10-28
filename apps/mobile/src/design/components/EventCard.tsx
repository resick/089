import { useTranslation } from 'react-i18next';
import { View, type ImageSourcePropType } from 'react-native';

import { makeStyles } from '../theme';
import { PlaceArt } from './PlaceArt';
import { PressableArea } from './PressableArea';
import { SaveButton } from './SaveButton';
import { Text } from './Text';

export type EventSummary = {
  title: string;
  /** Pre-formatted in the city's timezone, e.g. "Sat 2 Nov · 20:00". */
  when: string;
  venue?: string;
  /** e.g. "Free" or "from €18". */
  price?: string;
  photo?: ImageSourcePropType;
  cancelled?: boolean;
};

type Props = EventSummary & {
  layout?: 'card' | 'row';
  saved?: boolean;
  onToggleSave?: () => void;
  onPress: () => void;
};

/** Event as a carousel card or a list row (layout="row" is EventListItem). */
export function EventCard({
  layout = 'card',
  title,
  when,
  venue,
  price,
  photo,
  cancelled,
  saved = false,
  onToggleSave,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  const details = [venue, price].filter(Boolean).join(' · ');
  const label = [cancelled ? t('event.cancelled') : null, title, when, details]
    .filter(Boolean)
    .join(', ');
  const isRow = layout === 'row';

  // Save button sits beside the pressable, never inside it (no nested buttons).
  return (
    <View style={isRow ? styles.row : styles.card}>
      <PressableArea
        onPress={onPress}
        accessibilityLabel={label}
        style={isRow ? styles.rowMain : undefined}
      >
        <View style={isRow ? styles.thumb : undefined}>
          <PlaceArt category="events" photo={photo} aspectRatio={isRow ? 1 : 16 / 9} />
        </View>
        <View style={isRow ? styles.rowBody : styles.cardBody}>
          <Text variant="caption" color={cancelled ? 'danger' : 'accentText'} numberOfLines={1}>
            {cancelled ? `${t('event.cancelled')} · ${when}` : when}
          </Text>
          <Text
            variant={isRow ? 'bodyStrong' : 'title3'}
            numberOfLines={2}
            style={cancelled ? styles.struck : undefined}
          >
            {title}
          </Text>
          {details.length > 0 && (
            <Text variant="footnote" color="textSecondary" numberOfLines={1}>
              {details}
            </Text>
          )}
        </View>
      </PressableArea>
      {onToggleSave && isRow && (
        <SaveButton saved={saved} onToggle={onToggleSave} variant="plain" />
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: { width: 280 },
  cardBody: { paddingTop: t.space.sm, gap: t.space.xxs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    paddingVertical: t.space.xs,
  },
  thumb: { width: 64 },
  rowBody: { flex: 1, gap: t.space.xxs },
  struck: { textDecorationLine: 'line-through' },
}));
